
import { Router } from 'express';
import { spawn } from 'child_process';

const router = Router();

// تشغيل المساعد الذكي
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'رسالة مطلوبة' });
    }

    // يمكنك هنا استدعاء المساعد Python أو استخدام API مباشرة
    const response = await callAssistant(message);
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في المساعد الذكي' });
  }
});

async function callAssistant(message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', ['simple_assistant.py'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', () => {
      resolve(output.trim() || 'عذراً، لم أتمكن من الرد');
    });

    pythonProcess.stdin.write(message + '\n');
    pythonProcess.stdin.end();
  });
}

export default router;
