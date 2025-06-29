import { TaskInterceptor } from './task-interceptor';

export class TaskExecutor {
  private tasks: Map<string, Function> = new Map();
  private taskInterceptor: TaskInterceptor;

  constructor() {
    this.taskInterceptor = new TaskInterceptor();
    this.registerBuiltInTasks();
  }

  private registerBuiltInTasks() {
    // Matrix multiplication
    this.tasks.set('matrix_multiply', async (size = 100) => {
      const start = Date.now();
      
      // Simulate matrix multiplication
      const matrixA = this.generateMatrix(size, size);
      const matrixB = this.generateMatrix(size, size);
      const result = this.multiplyMatrices(matrixA, matrixB);
      
      return {
        operation: 'matrix_multiply',
        size,
        duration: Date.now() - start,
        result: `${size}x${size} matrix multiplication completed`
      };
    });

    // Prime calculation
    this.tasks.set('prime_calculation', async (limit = 10000) => {
      const start = Date.now();
      const primes = this.calculatePrimes(limit);
      
      return {
        operation: 'prime_calculation',
        limit,
        primesFound: primes.length,
        duration: Date.now() - start,
        result: `Found ${primes.length} primes up to ${limit}`
      };
    });

    // Data processing
    this.tasks.set('data_processing', async (dataSize = 1000) => {
      const start = Date.now();
      
      // Simulate data processing
      const data = Array.from({ length: dataSize }, (_, i) => i);
      const processed = data.map(x => Math.sin(x) * Math.cos(x)).reduce((a, b) => a + b, 0);
      
      return {
        operation: 'data_processing',
        dataSize,
        processedValue: processed,
        duration: Date.now() - start,
        result: `Processed ${dataSize} data points`
      };
    });

    // Image processing simulation
    this.tasks.set('image_processing', async (iterations = 100) => {
      const start = Date.now();
      
      // Simulate image processing
      let result = 0;
      for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(i) * Math.log(i + 1);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      return {
        operation: 'image_processing',
        iterations,
        result: `Processed ${iterations} iterations`,
        duration: Date.now() - start
      };
    });
  }

  async execute(functionName: string, args: any[] = [], kwargs: any = {}): Promise<any> {
    const task = this.tasks.get(functionName);
    if (!task) {
      throw new Error(`Unknown task: ${functionName}`);
    }

    try {
      return await task(...args, kwargs);
    } catch (error) {
      console.error(`Error executing task ${functionName}:`, error);
      throw error;
    }
  }

  async executeWithInterceptor(functionName: string, args: any[] = [], kwargs: any = {}): Promise<any> {
    const task = this.tasks.get(functionName);
    if (!task) {
      throw new Error(`Unknown task: ${functionName}`);
    }

    try {
      // Use the task interceptor to automatically decide on offloading
      const interceptedTask = this.taskInterceptor.offloadIfNeeded(task);
      return await interceptedTask(...args, kwargs);
    } catch (error) {
      console.error(`Error executing intercepted task ${functionName}:`, error);
      throw error;
    }
  }

  registerTask(name: string, func: Function): void {
    this.tasks.set(name, func);
  }

  getAvailableTasks(): string[] {
    return Array.from(this.tasks.keys());
  }

  private generateMatrix(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random())
    );
  }

  private multiplyMatrices(a: number[][], b: number[][]): number[][] {
    const result = Array.from({ length: a.length }, () =>
      Array.from({ length: b[0].length }, () => 0)
    );

    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }

    return result;
  }

  private calculatePrimes(limit: number): number[] {
    const primes: number[] = [];
    const sieve = new Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) {
        primes.push(i);
        for (let j = i * i; j <= limit; j += i) {
          sieve[j] = false;
        }
      }
    }

    return primes;
  }
}
