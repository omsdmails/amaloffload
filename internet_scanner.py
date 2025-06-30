
"""
internet_scanner.py - ماسح للبحث عن أجهزة DTS على الإنترنت
"""
import requests
import threading
import time
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

class InternetScanner:
    def __init__(self):
        self.discovered_peers = set()
        self.scan_ranges = [
            # نطاقات IP شائعة للخوادم العامة
            "8.8.8.0/24",      # Google DNS range
            "1.1.1.0/24",      # Cloudflare range
            "208.67.222.0/24", # OpenDNS range
        ]
        
    def scan_ip_range(self, ip_range: str, port: int = 7520):
        """مسح نطاق IP للبحث عن خوادم DTS"""
        import ipaddress
        
        try:
            network = ipaddress.ip_network(ip_range, strict=False)
            active_peers = []
            
            with ThreadPoolExecutor(max_workers=50) as executor:
                futures = []
                
                for ip in network.hosts():
                    future = executor.submit(self.check_dts_node, str(ip), port)
                    futures.append(future)
                
                for future in as_completed(futures, timeout=30):
                    try:
                        result = future.result()
                        if result:
                            active_peers.append(result)
                    except:
                        continue
                        
            return active_peers
            
        except Exception as e:
            logging.error(f"خطأ في مسح النطاق {ip_range}: {e}")
            return []
    
    def check_dts_node(self, ip: str, port: int = 7520) -> str:
        """فحص IP معين للتأكد من وجود خادم DTS"""
        try:
            url = f"http://{ip}:{port}/health"
            response = requests.get(url, timeout=2)
            
            if response.status_code == 200:
                # تحقق إضافي من أن هذا خادم DTS
                run_url = f"http://{ip}:{port}/run"
                test_response = requests.post(
                    run_url, 
                    json={"func": "health_check"}, 
                    timeout=2
                )
                
                if test_response.status_code in [200, 404]:  # 404 يعني الخادم يعمل لكن الدالة غير موجودة
                    logging.info(f"✅ اكتُشف خادم DTS: {ip}:{port}")
                    return run_url
                    
        except:
            pass
        return None
    
    def scan_public_repositories(self):
        """البحث في المستودعات العامة عن عناوين خوادم DTS"""
        try:
            # البحث في GitHub عن مشاريع DTS
            github_api = "https://api.github.com/search/repositories"
            params = {
                "q": "distributed task system port:7520",
                "sort": "updated",
                "per_page": 10
            }
            
            response = requests.get(github_api, params=params, timeout=10)
            if response.status_code == 200:
                repos = response.json().get("items", [])
                
                for repo in repos:
                    # محاولة استخراج IPs من وصف المشروع أو README
                    if repo.get("description"):
                        self.extract_ips_from_text(repo["description"])
                        
        except Exception as e:
            logging.warning(f"خطأ في البحث في المستودعات: {e}")
    
    def extract_ips_from_text(self, text: str):
        """استخراج عناوين IP من النص"""
        import re
        
        ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        ips = re.findall(ip_pattern, text)
        
        for ip in ips:
            try:
                # التحقق من صحة IP
                socket.inet_aton(ip)
                peer_url = f"http://{ip}:7520/run"
                
                # فحص سريع
                if self.check_dts_node(ip):
                    self.discovered_peers.add(peer_url)
                    
            except:
                continue
    
    def start_continuous_scan(self):
        """بدء المسح المستمر"""
        def scan_loop():
            while True:
                try:
                    # مسح النطاقات المحددة
                    for ip_range in self.scan_ranges:
                        peers = self.scan_ip_range(ip_range)
                        for peer in peers:
                            self.discovered_peers.add(peer)
                    
                    # البحث في المستودعات العامة
                    self.scan_public_repositories()
                    
                    logging.info(f"اكتُشف {len(self.discovered_peers)} خادم على الإنترنت")
                    
                except Exception as e:
                    logging.error(f"خطأ في المسح المستمر: {e}")
                
                # انتظار 30 دقيقة قبل المسح التالي
                time.sleep(1800)
        
        thread = threading.Thread(target=scan_loop, daemon=True)
        thread.start()
        logging.info("🔍 بدء المسح المستمر للإنترنت")
    
    def get_discovered_peers(self):
        """الحصول على قائمة الأجهزة المكتشفة"""
        return list(self.discovered_peers)

# إنشاء مثيل عام
internet_scanner = InternetScanner()
