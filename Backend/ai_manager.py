
import os
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

class AIManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIManager, cls).__new__(cls)
            cls._instance.init_models()
        return cls._instance

    def init_models(self):
        print("Loading AI Models... This may take a while.")
        
        # History storage: { user_id: [ {"role": "user", "content": "..."}, ... ] }
        self.chat_history = {}

        # 1. Emotion Detection Model
        try:
            self.emotion_classifier = pipeline(
                "text-classification", 
                model="j-hartmann/emotion-english-distilroberta-base", 
                top_k=1
            )
            print("Emotion model loaded.")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
            self.emotion_classifier = None

        # 2. Text Generation Model (Gemma-2b-it)
        # using google/gemma-2b-it as requested
        model_id = "google/gemma-2b-it"
        
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Loading {model_id} on {device}...")
            
            token = os.getenv("HF_TOKEN")
            if not token:
                print("⚠️ WARNING: HF_TOKEN not found in environment variables. Gemma model might fail to load if not authenticated via CLI.")

            self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=token)
            self.generator = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                device_map="auto" if device == "cuda" else None,
                token=token
            )
            if device == "cpu":
                self.generator.to("cpu")
                
            print(f"{model_id} model loaded successfully.")
        except Exception as e:
            print(f"Error loading {model_id}: {e}")
            self.generator = None
            self.tokenizer = None

    def detect_emotion(self, text):
        if not self.emotion_classifier:
            return "neutral"
        
        results = self.emotion_classifier(text)
        if results and len(results) > 0:
            top_result = results[0][0]
            return top_result['label']
        return "neutral"

    def generate_response(self, user_text, user_id="default"):
        emotion = self.detect_emotion(user_text)
        
        if not self.generator or not self.tokenizer:
            return f"I sense you are feeling {emotion}, but I cannot generate a full response right now (Model not loaded).", emotion

        # Manage History
        if user_id not in self.chat_history:
            self.chat_history[user_id] = []
        
        # Add user message to history
        self.chat_history[user_id].append({"role": "user", "content": user_text})
        
        # Keep history short (last 6 turns to save context)
        if len(self.chat_history[user_id]) > 6:
             self.chat_history[user_id] = self.chat_history[user_id][-6:]

        # Construct System Prompt (Gemma uses the 'model' role for replies, but we structure the prompt carefully)
        # Note: Gemma-it models expect specific user/model turns. We can inject instruction in the first user message or as a separate system-like prompt if simplified.
        # Strict format: <start_of_turn>user\n{content}<end_of_turn>\n<start_of_turn>model\n
        
        system_instruction = (
            f"You are Hiro, a helpful and empathetic AI assistant. "
            f"The user is currently feeling '{emotion}'. "
            f"Respond in a natural, supportive way. Do not explicitly state 'I see you are {emotion}'. "
            f"Instead, match their energy and offer appropriate advice or conversation."
        )

        messages = [
            {"role": "user", "content": system_instruction + "\n\n" + f"User message: {user_text}"}
        ]
        
        # We only really need the last few turns if we want context, but for simplicity/robustness with Gemma's template,
        # let's just stick to the current turn + instruction for now to ensure formatting holds up, 
        # or append history carefully.
        
        # Let's use the tokenizer's chat template which handles the formatting
        # We'll merge history:
        # But we need to inject the system instruction. 
        # Best way for single-turn-ish context with history:
        
        input_messages = []
        # Add a "system" equivalent as a user message context if the model doesn't support system roles properly (Gemma usually treats first prompt as context)
        input_messages.append({"role": "user", "content": system_instruction})
        input_messages.append({"role": "model", "content": "Understood. I will be Hiro, the supportive AI friend."})
        
        # Append recent history (excluding the one we just added)
        # We need to filter out the raw system instruction if it was stored, but here we rebuild it each time.
        # Actually, let's just use the current interaction context to be safe and avoid errors.
        input_messages.append({"role": "user", "content": user_text})
        
        try:
            prompt = self.tokenizer.apply_chat_template(input_messages, tokenize=False, add_generation_prompt=True)
            
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            if self.generator.device.type != 'cpu':
                inputs = inputs.to(self.generator.device)

            outputs = self.generator.generate(
                inputs, 
                max_new_tokens=150, 
                do_sample=True, 
                temperature=0.7,
                top_p=0.9
            )
            
            # Decode response
            response_text = self.tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)
            response_text = response_text.strip()
            
            # Add model response to history
            self.chat_history[user_id].append({"role": "model", "content": response_text})
            
            return response_text, emotion
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"I'm having trouble thinking clearly right now. (Error: {str(e)})", emotion
