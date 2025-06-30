
import os
import subprocess
import platform
import shutil
from pathlib import Path
import json

class CrossPlatformBuilder:
    def __init__(self):
        self.project_name = "nora_distributed_system"
        self.version = "1.0.0"
        self.build_dir = Path("builds")
        self.dist_dir = Path("dist")
        
    def setup_build_environment(self):
        """إعداد بيئة البناء"""
        self.build_dir.mkdir(exist_ok=True)
        self.dist_dir.mkdir(exist_ok=True)
        
        # إنشاء ملفات التكوين لكل منصة
        self._create_config_files()
        
    def _create_config_files(self):
        """إنشاء ملفات التكوين للمنصات المختلفة"""
        
        # Electron package.json
        electron_config = {
            "name": self.project_name,
            "version": self.version,
            "description": "نظام نورا الذكي الموزع",
            "main": "electron/main.js",
            "scripts": {
                "electron": "electron .",
                "build-windows": "electron-builder --win",
                "build-mac": "electron-builder --mac", 
                "build-linux": "electron-builder --linux",
                "build-all": "electron-builder -mwl"
            },
            "build": {
                "appId": "com.nora.distributed",
                "productName": "Nora Distributed System",
                "directories": {
                    "output": "dist"
                },
                "files": [
                    "build/**/*",
                    "electron/**/*",
                    "node_modules/**/*"
                ],
                "win": {
                    "target": [
                        {"target": "nsis", "arch": ["x64", "ia32", "arm64"]},
                        {"target": "portable", "arch": ["x64", "ia32"]},
                        {"target": "appx", "arch": ["x64", "ia32"]}
                    ],
                    "icon": "assets/icon.ico"
                },
                "mac": {
                    "target": [
                        {"target": "dmg", "arch": ["x64", "arm64"]},
                        {"target": "zip", "arch": ["x64", "arm64"]},
                        {"target": "mas", "arch": ["x64", "arm64"]}
                    ],
                    "icon": "assets/icon.icns"
                },
                "linux": {
                    "target": [
                        {"target": "AppImage", "arch": ["x64", "arm64"]},
                        {"target": "deb", "arch": ["x64", "arm64"]},
                        {"target": "rpm", "arch": ["x64", "arm64"]},
                        {"target": "snap", "arch": ["x64", "arm64"]}
                    ],
                    "icon": "assets/icon.png"
                }
            }
        }
        
        with open("electron-package.json", "w", encoding="utf-8") as f:
            json.dump(electron_config, f, indent=2, ensure_ascii=False)
            
    def build_web_app(self):
        """بناء تطبيق الويب"""
        print("🌐 بناء تطبيق الويب...")
        subprocess.run(["npm", "run", "build"], check=True)
        
    def build_desktop_apps(self):
        """بناء تطبيقات سطح المكتب لجميع المنصات"""
        print("🖥️ بناء تطبيقات سطح المكتب...")
        
        # إنشاء Electron wrapper
        self._create_electron_wrapper()
        
        # تثبيت Electron Builder
        subprocess.run(["npm", "install", "electron", "electron-builder", "--save-dev"], check=True)
        
        # بناء للمنصات المختلفة
        if platform.system() == "Windows":
            subprocess.run(["npm", "run", "build-windows"], check=True)
        elif platform.system() == "Darwin":
            subprocess.run(["npm", "run", "build-mac"], check=True)
        else:
            subprocess.run(["npm", "run", "build-linux"], check=True)
            
    def _create_electron_wrapper(self):
        """إنشاء Electron wrapper"""
        electron_dir = Path("electron")
        electron_dir.mkdir(exist_ok=True)
        
        main_js = """
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.png')
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:7520');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
"""
        
        with open(electron_dir / "main.js", "w") as f:
            f.write(main_js)
            
        preload_js = """
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: process.versions
});
"""
        
        with open(electron_dir / "preload.js", "w") as f:
            f.write(preload_js)
            
    def build_mobile_apps(self):
        """بناء تطبيقات الهاتف المحمول"""
        print("📱 بناء تطبيقات الهاتف المحمول...")
        
        # إنشاء Capacitor config
        self._create_capacitor_config()
        
        # تثبيت Capacitor
        subprocess.run(["npm", "install", "@capacitor/core", "@capacitor/cli"], check=True)
        subprocess.run(["npm", "install", "@capacitor/android", "@capacitor/ios"], check=True)
        
        # إنشاء مشاريع المنصات
        subprocess.run(["npx", "cap", "add", "android"], check=True)
        subprocess.run(["npx", "cap", "add", "ios"], check=True)
        
        # نسخ الملفات
        subprocess.run(["npx", "cap", "copy"], check=True)
        subprocess.run(["npx", "cap", "sync"], check=True)
        
    def _create_capacitor_config(self):
        """إنشاء تكوين Capacitor"""
        config = {
            "appId": "com.nora.distributed",
            "appName": "Nora Distributed System",
            "webDir": "build",
            "bundledWebRuntime": False,
            "server": {
                "url": "http://localhost:7520",
                "cleartext": True
            },
            "plugins": {
                "CapacitorHttp": {
                    "enabled": True
                },
                "SplashScreen": {
                    "launchShowDuration": 3000,
                    "launchAutoHide": True,
                    "backgroundColor": "#ffffffff",
                    "androidSplashResourceName": "splash",
                    "androidScaleType": "CENTER_CROP"
                }
            }
        }
        
        with open("capacitor.config.json", "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
            
    def create_pwa_manifest(self):
        """إنشاء PWA للهواتف الذكية"""
        print("📲 إنشاء PWA...")
        
        manifest = {
            "name": "نظام نورا الذكي الموزع",
            "short_name": "نورا",
            "description": "مساعد ذكي موزع مع قدرات التعلم الذاتي",
            "start_url": "/",
            "display": "standalone",
            "theme_color": "#007acc",
            "background_color": "#ffffff",
            "orientation": "portrait-primary",
            "icons": [
                {
                    "src": "/assets/icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/assets/icon-512.png", 
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        }
        
        manifest_dir = Path("client/public")
        manifest_dir.mkdir(exist_ok=True)
        
        with open(manifest_dir / "manifest.json", "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
            
    def build_all_platforms(self):
        """بناء جميع المنصات"""
        print("🚀 بدء بناء جميع المنصات...")
        
        self.setup_build_environment()
        self.build_web_app()
        self.create_pwa_manifest()
        self.build_desktop_apps()
        self.build_mobile_apps()
        
        print("✅ تم بناء جميع المنصات بنجاح!")
        print(f"📁 الملفات متوفرة في: {self.dist_dir}")

if __name__ == "__main__":
    builder = CrossPlatformBuilder()
    builder.build_all_platforms()
