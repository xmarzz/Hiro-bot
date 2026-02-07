
# Gemma Model Setup Instructions

You have switched Hiro-bot to use the **Google Gemma-2b-it** model.
Since Gemma is a "gated" model on Hugging Face, you need to provide an access token.

## Steps to Fix "Model not loaded" or Auth Errors:

1.  **Get a Hugging Face Token**:
    - Go to [Hugging Face Settings -> Tokens](https://huggingface.co/settings/tokens).
    - Create a new token (Read access is fine).
    - Ensure you have accepted the license terms for `google/gemma-2b-it` on its [model page](https://huggingface.co/google/gemma-2b-it).

2.  **Add Token to Environment**:
    - Open `Backend/.env`.
    - Add the following line:
      ```
      HF_TOKEN=your_token_starts_with_hf_...
      ```

3.  **Restart the Backend**:
    - Stop the running `python app.py`.
    - Run it again:
      ```bash
      cd Backend
      python app.py
      ```

4.  **Hardware Requirements**:
    - Gemma-2b requires about 2GB-4GB of VRAM (GPU) or RAM.
    - If it's too slow on CPU, consider using cloud hosting or a smaller model.
