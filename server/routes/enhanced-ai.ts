
import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

// تشغيل المساعد المحسن
router.post('/enhanced-chat', async (req, res) => {
  try {
    const { message, action } = req.body;
    
    if (!message && !action) {
      return res.status(400).json({ error: 'رسالة أو إجراء مطلوب' });
    }

    const response = await callEnhancedAssistant(message, action);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString(),
      type: action || 'chat'
    });
  } catch (error) {
    console.error('Enhanced AI error:', error);
    res.status(500).json({ error: 'خطأ في المساعد المحسن' });
  }
});

// إحصائيات المساعد
router.get('/stats', async (req, res) => {
  try {
    const stats = await getAssistantStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// تعليم المساعد معلومة جديدة
router.post('/learn', async (req, res) => {
  try {
    const { topic, content } = req.body;
    
    if (!topic || !content) {
      return res.status(400).json({ error: 'الموضوع والمحتوى مطلوبان' });
    }

    const result = await teachAssistant(topic, content);
    res.json({ success: true, message: result });
  } catch (error) {
    console.error('Learning error:', error);
    res.status(500).json({ error: 'خطأ في التعلم' });
  }
});

async function callEnhancedAssistant(message: string, action?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'enhanced_assistant.py');
    const args = ['enhanced_assistant.py'];
    
    if (action === 'scan') {
      args.push('--scan');
    } else if (action === 'stats') {
      args.push('--stats');
    }

    const pythonProcess = spawn('python3', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim() || 'تم تنفيذ الطلب بنجاح');
      } else {
        reject(new Error(errorOutput || 'خطأ غير معروف'));
      }
    });

    // إرسال الرسالة إلى المساعد
    if (message) {
      pythonProcess.stdin.write(message + '\n');
    }
    pythonProcess.stdin.end();
  });
}

async function getAssistantStats(): Promise<any> {
  return callEnhancedAssistant('', 'stats').then(output => {
    try {
      return JSON.parse(output);
    } catch {
      return { message: output };
    }
  });
}

async function teachAssistant(topic: string, content: string): Promise<string> {
  const teachCommand = `تعلم: ${topic} - ${content}`;
  return callEnhancedAssistant(teachCommand);
}

export default router;
