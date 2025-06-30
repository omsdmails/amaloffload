import os
import json
import argparse
import paramiko

def load_servers(config_path='config.json'):
    """تحميل قائمة الخوادم من ملف إعدادات JSON"""
    try:
        with open(config_path, 'r') as f:
            data = json.load(f)
            return data.get('servers', [])
    except Exception as e:
        print(f"[!] Failed to load config: {e}")
        return []

def copy_file(server, local_file, remote_file):
    """نسخ ملف من الجهاز المحلي إلى الخادم عبر SSH"""
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            hostname=server['host'],
            port=server.get('port', 22),  # 22 هو البورت الافتراضي لـ SSH
            username=server['username'],
            password=server['password']
        )
        sftp = ssh.open_sftp()
        sftp.put(local_file, remote_file)
        sftp.close()
        print(f"[+] Uploaded '{local_file}' to '{server['host']}:{remote_file}'")
        return ssh
    except Exception as e:
        print(f"[!] Failed to upload '{local_file}': {e}")
        return None

def execute_remote_command(ssh, command):
    """تنفيذ أمر على الخادم عن بعد وطباعة النتيجة"""
    try:
        stdin, stdout, stderr = ssh.exec_command(command)
        output = stdout.read().decode()
        errors = stderr.read().decode()
        if output:
            print(f"[+] Output:\n{output}")
        if errors:
            print(f"[!] Errors:\n{errors}")
    except Exception as e:
        print(f"[!] Failed to execute command: {e}")

def main():
    parser = argparse.ArgumentParser(description="Upload files to server.")
    parser.add_argument("files", nargs='+', help="Local files to upload")
    parser.add_argument("--remote-path", default="/tmp", help="Remote path to upload files to")
    parser.add_argument("--run", action="store_true", help="Execute main.py after upload")
    parser.add_argument("--config", default="config.json", help="Path to server config JSON file")
    args = parser.parse_args()

    servers = load_servers(args.config)
    if not servers:
        print("[!] No servers loaded.")
        return

    server = servers[0]  # اختيار أول سيرفر في القائمة
    for file in args.files:
        if not os.path.exists(file):
            print(f"[!] File not found: {file}")
            continue

        remote_file = os.path.join(args.remote_path, os.path.basename(file))
        ssh = copy_file(server, file, remote_file)
        if ssh and args.run and os.path.basename(file) == "main.py":
            execute_remote_command(ssh, f"python3 {remote_file}")
            ssh.close()

if __name__ == "__main__":
    main()
