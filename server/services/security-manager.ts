import { createHash, createCipher, createDecipher } from 'crypto';

export class SecurityManager {
  private sharedSecret: string;

  constructor(sharedSecret: string) {
    this.sharedSecret = sharedSecret;
  }

  encryptPayload(payload: any): any {
    try {
      const jsonString = JSON.stringify(payload);
      const hash = this.createHash(jsonString);
      
      return {
        data: payload,
        signature: hash,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error encrypting payload:', error);
      throw error;
    }
  }

  verifyPayload(encryptedPayload: any): boolean {
    try {
      const { data, signature, timestamp } = encryptedPayload;
      
      // Check timestamp (reject if older than 5 minutes)
      const now = Date.now();
      if (now - timestamp > 5 * 60 * 1000) {
        return false;
      }

      // Verify signature
      const expectedHash = this.createHash(JSON.stringify(data));
      return expectedHash === signature;
    } catch (error) {
      console.error('Error verifying payload:', error);
      return false;
    }
  }

  private createHash(data: string): string {
    return createHash('sha256')
      .update(data + this.sharedSecret)
      .digest('hex');
  }

  generateNodeId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return createHash('sha256')
      .update(timestamp + random + this.sharedSecret)
      .digest('hex')
      .substring(0, 16);
  }
}
