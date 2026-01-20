# LTX-2 Installation on Windows PC (192.168.0.248)

**Date:** January 14, 2026
**Windows User:** bmang
**GPU:** NVIDIA RTX 3070 (8GB VRAM)
**CUDA:** 12.6

---

## What We Accomplished

### 1. Initial Setup
- Installed Python 3.11 from python.org
- Git was already installed (v2.52)
- NVIDIA drivers working (CUDA 12.6)

### 2. LTX-2 Repository
- Cloned to: `C:\Users\bmang\LTX-2`
- Installed `uv` package manager
- Ran `uv sync --frozen` to install dependencies
- Virtual environment at: `C:\Users\bmang\LTX-2\.venv`

### 3. Downloaded Models (in LTX-2 folder)
Located at `C:\Users\bmang\LTX-2\models\`:
- `ltx-2-19b-distilled-fp8.safetensors` (~27GB)
- `ltx-2-spatial-upscaler-x2-1.0.safetensors` (~949MB)
- `gemma-3/` folder (Gemma 3 12B text encoder)

### 4. Direct CLI Approach (Failed)
- Triton module doesn't work on Windows
- Couldn't run the Python pipeline directly

### 5. ComfyUI Installation
- Downloaded portable version to: `C:\ComfyUI\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable`
- Fixed PyTorch CUDA version mismatch:
  ```cmd
  .\python_embeded\python.exe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126 --force-reinstall
  ```
- Installed VC++ Redistributable
- Cloned LTXVideo custom nodes:
  ```cmd
  cd C:\ComfyUI\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\ComfyUI\custom_nodes
  git clone https://github.com/Lightricks/ComfyUI-LTXVideo
  ```

### 6. ComfyUI Models Downloaded
Downloaded from HuggingFace and placed in ComfyUI model folders:
- `text_encoders/gemma_3_12B_it_fp4_mixed.safetensors` (8.8GB)
- `checkpoints/ltx-2-19b-distilled.safetensors` (40GB)
- `latent_upscale_models/ltx-2-spatial-upscaler-x2-1.0.safetensors` (949MB)
- `loras/ltx-2-19b-lora-camera-control-dolly-left.safetensors` (312MB)

---

## Current Status: ALMOST WORKING

ComfyUI starts, workflow loads, but crashes when running with error "model_type FLUX" - model detection issue.

---

## To Resume: Troubleshooting Steps

1. **Start ComfyUI:**
   ```cmd
   cd C:\ComfyUI\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable
   .\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build
   ```

2. **Verify model files are in correct locations:**
   ```cmd
   dir "C:\ComfyUI\...\ComfyUI\models\checkpoints"
   dir "C:\ComfyUI\...\ComfyUI\models\latent_upscale_models"
   dir "C:\ComfyUI\...\ComfyUI\models\text_encoders"
   dir "C:\ComfyUI\...\ComfyUI\models\loras"
   ```

3. **Load workflow:**
   - Open http://127.0.0.1:8188
   - Load: `ComfyUI\custom_nodes\ComfyUI-LTXVideo\example_workflows\LTX-2_I2V_Distilled_wLora.json`

4. **If model mismatch error:**
   - May need to update ComfyUI-LTXVideo nodes
   - Or check if workflow nodes are pointing to correct model files
   - The workflow may need specific LTX loader nodes instead of generic ones

---

## Useful Commands

**Activate LTX-2 venv:**
```cmd
cd C:\Users\bmang\LTX-2
.venv\Scripts\activate
```

**Run ComfyUI manually:**
```cmd
cd C:\ComfyUI\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable
.\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build
```

**Test CUDA in ComfyUI:**
```cmd
.\python_embeded\python.exe -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
```

---

## HuggingFace Token
Token was configured for user. If needed again:
- Login: https://huggingface.co/login
- Token: https://huggingface.co/settings/tokens
- Accept Gemma license: https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized

---

## Notes
- 8GB VRAM is tight for this 19B model - may need to reduce resolution/frames
- FP8 model variant uses less memory
- ComfyUI has better memory management than direct CLI
