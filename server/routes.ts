import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertNodeSchema, insertTaskSchema, insertSystemLogSchema, insertBroadcastMessageSchema } from "@shared/schema";
import { OffloadSystem } from "./services/offload-system";
import { SystemMonitor } from "./utils/system-monitor";
import aiRoutes from './routes/ai';
import enhancedAiRoutes from './routes/enhanced-ai';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    port: 8347,
    path: '/api/ws' // Use specific path to avoid Vite HMR conflicts
  });

  // Initialize offload system
  const offloadSystem = new OffloadSystem();
  const systemMonitor = new SystemMonitor();

  // Start background services
  await offloadSystem.initialize();
  systemMonitor.start();

  // WebSocket connection for real-time updates
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send initial data
    ws.send(JSON.stringify({
      type: 'initial_data',
      data: {
        nodes: storage.getAllNodes(),
        tasks: storage.getAllTasks(),
        logs: storage.getRecentLogs(10)
      }
    }));

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // API Routes

  // Get system overview
  app.get('/api/system/overview', async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      const tasks = await storage.getAllTasks();
      const logs = await storage.getRecentLogs(10);

      const systemStats = {
        totalNodes: nodes.length,
        activeNodes: nodes.filter(n => n.status === 'online').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        processingTasks: tasks.filter(t => t.status === 'processing').length,
        failedTasks: tasks.filter(t => t.status === 'failed').length,
        averageLoad: nodes.reduce((sum, n) => sum + n.load, 0) / nodes.length || 0,
        uptime: systemMonitor.getUptime(),
        throughput: systemMonitor.getThroughput()
      };

      res.json({
        stats: systemStats,
        nodes,
        tasks: tasks.slice(0, 10), // Recent tasks
        logs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Node management
  app.get('/api/nodes', async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/nodes', async (req, res) => {
    try {
      const nodeData = insertNodeSchema.parse(req.body);
      const node = await storage.createNode(nodeData);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/nodes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const node = await storage.updateNode(id, updates);
      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }
      res.json(node);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Task management
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);

      // Try to offload the task
      offloadSystem.submitTask(task);

      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Task execution endpoint (for other nodes to call)
  app.post('/api/execute', async (req, res) => {
    try {
      const { taskId, functionName, args, kwargs } = req.body;

      // Execute the task
      const result = await offloadSystem.executeTask(functionName, args, kwargs);

      // Update task status
      await storage.updateTask(taskId, {
        status: 'completed',
        result,
        completedAt: new Date()
      });

      res.json({ result });
    } catch (error) {
      // Update task status as failed
      if (req.body.taskId) {
        await storage.updateTask(req.body.taskId, {
          status: 'failed',
          error: error.message
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Smart task execution with automatic offloading
  app.post('/api/execute-smart', async (req, res) => {
    try {
      const { functionName, args = [], kwargs = {} } = req.body;

      if (!functionName) {
        return res.status(400).json({ error: 'Function name is required' });
      }

      // Create task record
      const task = await storage.createTask({
        name: functionName,
        status: 'pending',
        nodeId: null,
        complexity: 0,
        result: null,
        error: null,
        duration: null
      });

      // Execute with smart interceptor
      const startTime = Date.now();
      const result = await offloadSystem.executeTask(functionName, args, kwargs);
      const duration = Date.now() - startTime;

      // Update task with result
      await storage.updateTask(task.id, {
        status: 'completed',
        result,
        duration,
        completedAt: new Date()
      });

      res.json({ 
        taskId: task.id,
        result,
        duration,
        executionType: 'local' // This would be determined by the interceptor
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: systemMonitor.getUptime()
    });
  });

  // System logs
  app.get('/api/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getRecentLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/logs', async (req, res) => {
    try {
      const logData = insertSystemLogSchema.parse(req.body);
      const log = await storage.createSystemLog(logData);

      // Broadcast to WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({
            type: 'new_log',
            data: log
          }));
        }
      });

      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Metrics endpoint
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = systemMonitor.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Broadcast messages endpoints
  app.post('/api/broadcast', async (req, res) => {
    try {
      const validatedMessage = insertBroadcastMessageSchema.parse(req.body);
      const message = await storage.createBroadcastMessage(validatedMessage);

      // Send broadcast via WebSocket to all connected clients
      const connectedNodes = await storage.getAllNodes();
      const activeConnections = Array.from(wss.clients).filter(ws => ws.readyState === 1);

      const broadcastData = {
        type: 'broadcast_message',
        data: {
          id: message.id,
          message: message.message,
          senderNode: message.senderNode,
          timestamp: message.timestamp,
          recipients: connectedNodes.filter(node => node.status === 'online').map(node => node.name)
        }
      };

      activeConnections.forEach(ws => {
        ws.send(JSON.stringify(broadcastData));
      });

      // Update message as delivered
      await storage.updateBroadcastMessage(message.id, { 
        delivered: true, 
        recipients: broadcastData.data.recipients 
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/broadcast', async (req, res) => {
    try {
      const messages = await storage.getAllBroadcastMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Suggestions API
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { name, email, suggestion } = req.body;

      if (!name?.trim() || !suggestion?.trim()) {
        return res.status(400).json({ 
          error: "الاسم والاقتراح مطلوبان" 
        });
      }

      // Store suggestion (you can add database storage here later)
      const suggestionData = {
        id: Date.now(),
        name: name.trim(),
        email: email?.trim() || null,
        suggestion: suggestion.trim(),
        timestamp: new Date().toISOString(),
        ip: req.ip
      };

      console.log("📝 New suggestion received:", suggestionData);

      res.json({ 
        success: true, 
        message: "تم استلام الاقتراح بنجاح" 
      });
    } catch (error) {
      console.error("Error processing suggestion:", error);
      res.status(500).json({ 
        error: "حدث خطأ في الخادم" 
      });
    }
  });

  app.use('/api/ai', aiRoutes);
  app.use('/api/enhanced-ai', enhancedAiRoutes);

  // Execute distributed task
  app.post('/api/execute-task', async (req, res) => {
    try {
      const { taskType, params } = req.body;

      // قائمة المهام المدعومة
      const supportedTasks = [
        'matrix_multiply', 'prime_calculation', 'data_processing',
        'video_format_conversion', 'video_effects_processing', 'render_3d_scene',
        'physics_simulation', 'game_ai_processing',
        // مهام البث المباشر الجديدة
        'process_game_stream', 'real_time_video_enhancement', 
        'multi_stream_processing', 'ai_commentary_generation', 
        'stream_quality_optimization'
      ];

      if (!supportedTasks.includes(taskType)) {
        return res.status(400).json({ error: 'Unsupported task type' });
      }

      // محاكاة تنفيذ المهمة
      const result = await simulateTaskExecution(taskType, params);

      res.json(result);
    } catch (error) {
      console.error('Task execution error:', error);
      res.status(500).json({ error: 'Failed to execute task' });
    }
  });

  // دالة محاكاة تنفيذ المهام
  async function simulateTaskExecution(taskType: string, params: any) {
    const startTime = Date.now();

    // محاكاة وقت المعالجة
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const processingTime = (Date.now() - startTime) / 1000;

    // نتائج محاكاة حسب نوع المهمة
    switch (taskType) {
      case 'process_game_stream':
        return {
          status: 'success',
          stream_type: 'game',
          fps_processed: params.fps || 60,
          resolution: params.resolution || '1920x1080',
          frames_processed: params.stream_data?.length || 60,
          enhancements_applied: params.enhancements || ['noise_reduction'],
          quality_score: Math.round(60 + Math.random() * 30),
          latency_ms: Math.round(50 + Math.random() * 100),
          processing_time: processingTime,
          bandwidth_optimized: true
        };

      case 'real_time_video_enhancement':
        return {
          status: 'success',
          video_quality: params.video_quality || '1080p',
          target_fps: params.target_fps || 60,
          enhancements: params.enhancement_types?.reduce((acc: any, type: string) => {
            acc[type] = {
              improvement: Math.round(15 + Math.random() * 20),
              processing_cost: Math.round(processingTime / params.enhancement_types.length * 1000) / 1000
            };
            return acc;
          }, {}),
          processing_time: processingTime,
          real_time_capable: processingTime < 0.016
        };

      case 'multi_stream_processing':
        return {
          status: 'success',
          streams_processed: params.streams_data?.length || 3,
          processing_mode: params.processing_mode || 'parallel',
          results: params.streams_data?.reduce((acc: any, stream: any, i: number) => {
            acc[`stream_${i+1}`] = {
              status: 'processed',
              quality: stream.quality,
              fps: stream.fps,
              enhancement_applied: true,
              processing_node: `node_${(i % 3) + 1}`
            };
            return acc;
          }, {}) || {},
          processing_time: processingTime,
          nodes_utilized: Math.min(params.streams_data?.length || 3, 3)
        };

      case 'ai_commentary_generation':
        return {
          status: 'success',
          language: params.language || 'ar',
          commentary_length: Math.min(params.commentary_length || 50, 10),
          generated_text: [
            'حركة رائعة من اللاعب!',
            'هذا هدف مذهل!',
            'دفاع قوي في هذه اللحظة'
          ],
          game_events_analyzed: params.game_events?.length || 5,
          processing_time: processingTime,
          emotion_detection: 'excited',
          context_awareness: true
        };

      case 'stream_quality_optimization':
        const optimalQuality = Math.min(params.target_bandwidth * 200, 1080);
        return {
          status: 'success',
          original_quality: params.stream_metadata?.quality || '1080p',
          optimized_quality: `${Math.round(optimalQuality)}p`,
          optimal_fps: optimalQuality >= 1080 ? 60 : optimalQuality >= 720 ? 45 : 30,
          target_bandwidth: params.target_bandwidth,
          viewer_count: params.viewer_count,
          bandwidth_saved: Math.round(Math.max(0, (1080 - optimalQuality) / 1080 * 100)),
          processing_time: processingTime,
          adaptive_streaming: true
        };

      default:
        return {
          status: 'success',
          processing_time: processingTime,
          result: `Task ${taskType} completed successfully`
        };
    }
  }

  return httpServer;
}