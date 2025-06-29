import { Bonjour } from 'bonjour-service';
import { storage } from '../storage';
import type { Node } from '@shared/schema';

export class PeerDiscovery {
  private bonjour: any;
  private isRunning = false;
  private discoveredPeers = new Map<string, Node>();

  constructor() {
    this.bonjour = new Bonjour();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Advertise this service
      this.bonjour.publish({
        name: process.env.NODE_NAME || 'dts-node',
        type: 'dts',
        port: 5000,
        txt: {
          version: '1.0',
          capabilities: 'matrix_multiply,prime_calculation,data_processing'
        }
      });

      // Browse for other services
      const browser = this.bonjour.find({ type: 'dts' });
      
      browser.on('up', (service: any) => {
        this.handleServiceUp(service);
      });

      browser.on('down', (service: any) => {
        this.handleServiceDown(service);
      });

      this.isRunning = true;
      console.log('Peer discovery started');
    } catch (error) {
      console.error('Failed to start peer discovery:', error);
      throw error;
    }
  }

  private async handleServiceUp(service: any): Promise<void> {
    try {
      const nodeData = {
        name: service.name,
        ip: service.referer?.address || service.addresses?.[0] || 'unknown',
        port: service.port,
        status: 'online' as const,
        load: 0.0,
        capabilities: {
          supportedOperations: service.txt?.capabilities?.split(',') || []
        }
      };

      // Check if node already exists
      const existingNodes = await storage.getAllNodes();
      const existingNode = existingNodes.find(n => n.ip === nodeData.ip && n.port === nodeData.port);

      if (existingNode) {
        // Update existing node
        await storage.updateNode(existingNode.id, {
          status: 'online',
          lastSeen: new Date()
        });
      } else {
        // Create new node
        const node = await storage.createNode(nodeData);
        this.discoveredPeers.set(`${nodeData.ip}:${nodeData.port}`, node);
      }

      // Log discovery
      await storage.createSystemLog({
        level: 'info',
        message: `New peer discovered: ${nodeData.ip}:${nodeData.port}`,
        source: 'peer-discovery.ts',
        nodeId: null
      });

    } catch (error) {
      console.error('Error handling service up:', error);
    }
  }

  private async handleServiceDown(service: any): Promise<void> {
    try {
      const key = `${service.referer?.address || service.addresses?.[0]}:${service.port}`;
      const node = this.discoveredPeers.get(key);

      if (node) {
        await storage.updateNode(node.id, {
          status: 'offline',
          lastSeen: new Date()
        });

        this.discoveredPeers.delete(key);

        // Log disconnection
        await storage.createSystemLog({
          level: 'warning',
          message: `Peer disconnected: ${key}`,
          source: 'peer-discovery.ts',
          nodeId: node.id
        });
      }
    } catch (error) {
      console.error('Error handling service down:', error);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.bonjour.unpublishAll();
    this.bonjour.destroy();
    this.isRunning = false;
    console.log('Peer discovery stopped');
  }

  getDiscoveredPeers(): Node[] {
    return Array.from(this.discoveredPeers.values());
  }
}
