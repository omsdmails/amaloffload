#!/usr/bin/env bash
set -euo pipefail

# تثبيت الاعتماديات
python3 -m pip install --upgrade pip setuptools wheel
python3 -m pip install pyinstaller==5.13.0

# نظّف مجلد dist
rm -rf dist

# بناء البايناري مع hidden-imports
pyinstaller --onefile \
  --name offloadhelper_linux \
  --hidden-import=ipaddress \
  --hidden-import=urllib.parse \
  --hidden-import=pyimod02_importers \
  --hidden-import=pathlib \
  main.py

# رفع الخطأ في حال لم يجد الباينري
if [ ! -f dist/offloadhelper_linux ]; then
  echo "❌ dist/offloadhelper_linux not found" >&2
  exit 1
fi
