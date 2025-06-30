
#!/bin/bash

echo "🚀 بدء نشر نظام نورا على جميع المنصات..."

# إعداد المتغيرات
PROJECT_NAME="nora-distributed-system"
VERSION="1.0.0"

# تنظيف الملفات السابقة
echo "🧹 تنظيف الملفات السابقة..."
rm -rf dist/ builds/ 

# بناء الويب
echo "🌐 بناء تطبيق الويب..."
npm run build

# بناء PWA
echo "📲 إنشاء PWA..."
python3 build_system/cross_platform_builder.py

# بناء سطح المكتب
echo "🖥️ بناء تطبيقات سطح المكتب..."

# Windows (إذا كان متاحاً)
if command -v wine &> /dev/null; then
    echo "🪟 بناء Windows..."
    npm run electron:build-win
fi

# macOS (إذا كان متاحاً)  
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 بناء macOS..."
    npm run electron:build-mac
fi

# Linux
echo "🐧 بناء Linux..."
npm run electron:build-linux

# Android
echo "🤖 بناء Android..."
if command -v android &> /dev/null; then
    npx cap build android --prod
    cd android && ./gradlew assembleRelease
    cd ..
fi

# iOS (macOS فقط)
if [[ "$OSTYPE" == "darwin"* ]] && command -v xcodebuild &> /dev/null; then
    echo "📱 بناء iOS..."
    npx cap build ios --prod
fi

echo "✅ تم الانتهاء من بناء جميع المنصات!"
echo "📁 الملفات متوفرة في مجلد dist/"

# إنشاء تقرير
echo "📊 إنشاء تقرير البناء..."
python3 -c "
import os
import json
from pathlib import Path

builds = []
for root, dirs, files in os.walk('dist'):
    for file in files:
        if file.endswith(('.exe', '.dmg', '.AppImage', '.deb', '.rpm', '.apk', '.ipa')):
            path = os.path.join(root, file)
            size = os.path.getsize(path)
            builds.append({
                'platform': file.split('.')[-1],
                'file': file,
                'size_mb': round(size / 1024 / 1024, 2),
                'path': path
            })

report = {
    'project': '$PROJECT_NAME',
    'version': '$VERSION', 
    'builds': builds,
    'total_size_mb': sum(b['size_mb'] for b in builds)
}

with open('dist/build_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

print('📋 تقرير البناء:')
for build in builds:
    print(f'  {build[\"platform\"]}: {build[\"file\"]} ({build[\"size_mb\"]} MB)')
print(f'📦 إجمالي الحجم: {report[\"total_size_mb\"]} MB')
"

echo "🎉 تم بناء ونشر النظام بنجاح على جميع المنصات!"
