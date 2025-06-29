import { cpus, totalmem, freemem } from 'os';

export class SystemMonitor {
  private startTime: number;
  private taskCount = 0;
  private lastThroughputCheck = Date.now();
  private tasksInLastPeriod = 0;

  constructor() {
    this.startTime = Date.now();
  }

  start(): void {
    // Start periodic monitoring
    setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  private updateMetrics(): void {
    // This would normally collect and store metrics
    // For now, we'll just log current system state
    const metrics = this.getCurrentMetrics();
    console.log('System metrics:', metrics);
  }

  getCurrentMetrics() {
    const cpuUsage = this.getCpuUsage();
    const memoryUsage = this.getMemoryUsage();
    
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      uptime: this.getUptime(),
      timestamp: new Date().toISOString()
    };
  }

  private getCpuUsage(): number {
    const cpuInfo = cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpuInfo.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return Math.round((1 - totalIdle / totalTick) * 100) / 100;
  }

  private getMemoryUsage(): number {
    const total = totalmem();
    const free = freemem();
    return Math.round(((total - free) / total) * 100) / 100;
  }

  getUptime(): string {
    const uptimeMs = Date.now() - this.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m ${seconds % 60}s`;
    }
  }

  incrementTaskCount(): void {
    this.taskCount++;
    this.tasksInLastPeriod++;
  }

  getThroughput(): number {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastThroughputCheck;
    
    if (timeSinceLastCheck >= 60000) { // 1 minute
      const throughput = Math.round((this.tasksInLastPeriod / timeSinceLastCheck) * 60000); // tasks per minute
      this.tasksInLastPeriod = 0;
      this.lastThroughputCheck = now;
      return throughput;
    }
    
    return 0;
  }
}
