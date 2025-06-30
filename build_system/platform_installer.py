
import os
import subprocess
import platform
import urllib.request
import zipfile
import tarfile
from pathlib import Path

class PlatformInstaller:
    def __init__(self):
        self.system = platform.system().lower()
        self.arch = platform.machine().lower()
        
    def install_dependencies(self):
        """تثبيت جميع التبعيات المطلوبة"""
        print("📦 تثبيت التبعيات...")
        
        # Node.js dependencies
        self._install_node_dependencies()
        
        # Android Studio (للأندرويد)
        if self._confirm_install("Android Studio للأندرويد"):
            self._install_android_studio()
            
        # Xcode (للآيفون - Mac فقط)
        if self.system == "darwin" and self._confirm_install("Xcode للآيفون"):
            self._install_xcode_tools()
            
    def _install_node_dependencies(self):
        """تثبيت Node.js dependencies"""
        dependencies = [
            "electron",
            "electron-builder", 
            "@capacitor/core",
            "@capacitor/cli",
            "@capacitor/android",
            "@capacitor/ios",
            "cordova",
            "@ionic/cli"
        ]
        
        for dep in dependencies:
            print(f"تثبيت {dep}...")
            subprocess.run(["npm", "install", "-g", dep], check=True)
            
    def _install_android_studio(self):
        """تثبيت Android Studio"""
        print("📱 تثبيت Android Studio...")
        
        if self.system == "windows":
            url = "https://dl.google.com/dl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-windows.exe"
        elif self.system == "darwin":
            url = "https://dl.google.com/dl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-mac.dmg"
        else:  # Linux
            url = "https://dl.google.com/dl/android/studio/ide-zips/2023.1.1.28/android-studio-2023.1.1.28-linux.tar.gz"
            
        print(f"تحميل من: {url}")
        print("⚠️ يرجى إكمال التثبيت يدوياً")
        
    def _install_xcode_tools(self):
        """تثبيت Xcode command line tools"""
        if self.system != "darwin":
            print("⚠️ Xcode متوفر فقط على macOS")
            return
            
        try:
            subprocess.run(["xcode-select", "--install"], check=True)
            print("✅ تم تثبيت Xcode tools")
        except subprocess.CalledProcessError:
            print("⚠️ يرجى تثبيت Xcode من App Store")
            
    def _confirm_install(self, tool_name):
        """تأكيد التثبيت من المستخدم"""
        response = input(f"هل تريد تثبيت {tool_name}؟ (y/n): ")
        return response.lower() in ['y', 'yes', 'نعم']
        
    def setup_android_env(self):
        """إعداد بيئة الأندرويد"""
        print("🤖 إعداد بيئة Android...")
        
        android_home = Path.home() / "Android/Sdk"
        if not android_home.exists():
            print(f"⚠️ يرجى تعيين ANDROID_HOME إلى: {android_home}")
            
        # إعداد متغيرات البيئة
        env_vars = {
            "ANDROID_HOME": str(android_home),
            "ANDROID_SDK_ROOT": str(android_home)
        }
        
        for var, path in env_vars.items():
            os.environ[var] = path
            print(f"تم تعيين {var}={path}")

if __name__ == "__main__":
    installer = PlatformInstaller()
    installer.install_dependencies()
    installer.setup_android_env()
