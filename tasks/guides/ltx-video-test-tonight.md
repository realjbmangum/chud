# LTX-Video Local Testing - Tonight

## Goal
Test LTX-Video on gaming rig (RTX 4070, 12GB VRAM) for local AI video generation for pet health content.

---

## Pre-Flight Checklist

- [ ] Gaming rig is on
- [ ] NVIDIA drivers up to date
- [ ] Python 3.10+ installed
- [ ] CUDA 12.2 installed (check with `nvcc --version`)
- [ ] Have a test pet image ready

---

## Step 1: Clone & Install

```bash
cd ~  # or wherever you want to install
git clone https://github.com/Lightricks/LTX-Video.git
cd LTX-Video

# Create virtual environment
python -m venv env

# Activate it
# Linux/Mac:
source env/bin/activate
# Windows:
env\Scripts\activate

# Install dependencies
pip install -e ".[inference]"
```

**Expected time:** 5-10 minutes (downloads ~5GB of dependencies)

---

## Step 2: Test Text-to-Video (2B Model)

Start with the lightweight model to confirm everything works:

```bash
python inference.py \
  --prompt "A golden retriever walking through a sunny park, wagging its tail" \
  --height 480 \
  --width 720 \
  --num_frames 65 \
  --seed 42 \
  --pipeline_config configs/ltxv-2b-0.9.8-distilled.yaml
```

**What to expect:**
- First run downloads model weights (~4GB)
- Generation should take 1-3 minutes
- Output saves to `outputs/` folder

---

## Step 3: Test Image-to-Video

Animate a still image (this is what we want for pet health content):

```bash
python inference.py \
  --prompt "The dog turns its head slowly and looks at the camera" \
  --conditioning_media_paths /path/to/your/dog-image.jpg \
  --conditioning_start_frames 0 \
  --height 480 \
  --width 720 \
  --num_frames 65 \
  --seed 42 \
  --pipeline_config configs/ltxv-2b-0.9.8-distilled.yaml
```

**Replace** `/path/to/your/dog-image.jpg` with actual image path.

---

## Step 4: Try 13B Distilled (If 2B Works)

Higher quality, more VRAM:

```bash
python inference.py \
  --prompt "A cat stretching on a windowsill in warm afternoon light" \
  --height 480 \
  --width 720 \
  --num_frames 65 \
  --seed 42 \
  --pipeline_config configs/ltxv-13b-0.9.8-distilled.yaml
```

**If you get CUDA OOM (out of memory):**
- Reduce `--num_frames` to 33
- Reduce resolution to `--height 320 --width 480`
- Stick with 2B model

---

## Step 5: Test Video Extension

Extend an existing clip (useful for making 5-sec clips longer):

```bash
python inference.py \
  --prompt "The dog continues walking forward" \
  --conditioning_media_paths /path/to/existing-video.mp4 \
  --conditioning_start_frames 0 \
  --height 480 \
  --width 720 \
  --num_frames 121 \
  --seed 42 \
  --pipeline_config configs/ltxv-2b-0.9.8-distilled.yaml
```

**Note:** Input video must have frames = multiple of 8 + 1 (9, 17, 25, etc.)

---

## Frame Count Reference

| Frames | Duration @ 24fps |
|--------|------------------|
| 25 | ~1 sec |
| 49 | ~2 sec |
| 65 | ~2.7 sec |
| 97 | ~4 sec |
| 121 | ~5 sec |

---

## Troubleshooting

### CUDA out of memory
```bash
# Reduce frames
--num_frames 33

# Or reduce resolution
--height 320 --width 480
```

### Slow generation
Your 4070 supports FP8 (Ada architecture). Check if FP8 kernels are enabled in the config.

### Poor quality output
The CLI script isn't as optimized as ComfyUI. If results are bad:
1. Try ComfyUI instead: https://github.com/Lightricks/ComfyUI-LTXVideo/
2. Or use the quantized version: https://github.com/City96/LTX-VideoQ8

### Model download fails
Models download from Hugging Face. If blocked:
```bash
pip install huggingface_hub
huggingface-cli login
```

---

## Success Criteria

- [ ] 2B model generates a video without crashing
- [ ] Image-to-video works with a pet image
- [ ] Quality is acceptable for B-roll use
- [ ] Generation time is under 5 minutes per clip

---

## If This Works Well

Next steps:
1. Set up ComfyUI for better quality
2. Create a batch script for multiple prompts
3. Test with actual pet health content images
4. Compare quality vs Runway/Veo

---

## Links

- GitHub: https://github.com/Lightricks/LTX-Video
- ComfyUI Integration: https://github.com/Lightricks/ComfyUI-LTXVideo/
- Quantized (lower VRAM): https://github.com/City96/LTX-VideoQ8

---

*Created: 2025-01-14*
