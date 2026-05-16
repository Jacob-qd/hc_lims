#!/bin/bash
# Image analysis helper for HC-LIMS debugging
# Usage: ./ocr.sh <image_path>
# Outputs OCR text and basic image info

IMAGE="$1"
if [ -z "$IMAGE" ]; then
  echo "Usage: ./ocr.sh <image_path>"
  exit 1
fi

echo "=== Image Info ==="
python3 -c "
from PIL import Image
img = Image.open('$IMAGE')
print(f'Size: {img.size[0]}x{img.size[1]}')
print(f'Format: {img.format}')
print(f'Mode: {img.mode}')
"

echo ""
echo "=== OCR Text (Chinese) ==="
tesseract "$IMAGE" /tmp/ocr_debug -l chi_sim 2>/dev/null
cat /tmp/ocr_debug.txt

echo ""
echo "=== OCR Text (English) ==="
tesseract "$IMAGE" /tmp/ocr_debug_en 2>/dev/null
cat /tmp/ocr_debug_en.txt
