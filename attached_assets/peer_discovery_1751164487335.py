def add_service(self, zc, type_, name):
        self._process_service(zc, type_, name)

    def update_service(self, zc, type_, name):
        self._process_service(zc, type_, name)

    def _process_service(self, zc, type_, name):
        info = zc.get_service_info(type_, name)
        if info and info.addresses:
            ip = socket.inet_ntoa(info.addresses[0])
            device = Device(
                name=name,
                ip=ip,
                port=info.port,
                device_type="local",
            )
            if not self.discoverer._is_duplicate_device(device.dict):
                self.discoverer.local_devices.append(device)
                logger.info(f"[DISCOVERY] جهاز محلي: {device.name} ({device.ip}:{device.port})")

-------------------------- اختبار يدوي --------------------------

if name == "main": discoverer = NetworkDiscoverer()

try:
    while True:
        devices = discoverer.discover_all_devices()
        print("\n" + "=" * 50)
        print(f"الأجهزة المحليّة ({len(devices['local'])}):")
        for d in devices["local"]:
            print(f" - {d.name}  => {d.ip}:{d.port}")

        print(f"\nالأجهزة الخارجيّة ({len(devices['external'])}):")
        for d in devices["external"]:
            print(f" - {d.name}  => {d.ip}:{d.port}")

        time.sleep(10)
except KeyboardInterrupt:
    print("\nتم الإيقاف يدويًا.")
