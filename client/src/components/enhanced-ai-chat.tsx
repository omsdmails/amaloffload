
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Brain, BarChart3, Scan, BookOpen } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AssistantStats {
  معرفة_محفوظة: number;
  ذكريات: number;
  سجل_محادثات: number;
  آخر_تحديث: string;
}

export function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AssistantStats | null>(null);
  const [teachTopic, setTeachTopic] = useState('');
  const [teachContent, setTeachContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (message: string, action?: string) => {
    if (!message.trim() && !action) return;

    const userMessage: Message = {
      type: 'user',
      content: message || `تنفيذ: ${action}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/enhanced-ai/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, action })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        type: 'assistant',
        content: 'عذراً، حدث خطأ في التواصل مع المساعد',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const getStats = async () => {
    try {
      const response = await fetch('/api/enhanced-ai/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const teachAssistant = async () => {
    if (!teachTopic.trim() || !teachContent.trim()) return;

    try {
      const response = await fetch('/api/enhanced-ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: teachTopic, 
          content: teachContent 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const successMessage: Message = {
          type: 'assistant',
          content: `✅ ${data.message}`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
        setTeachTopic('');
        setTeachContent('');
      }
    } catch (error) {
      console.error('Teaching error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* المحادثة الرئيسية */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-6 w-6 text-purple-600" />
              نورا المحسنة - المساعد الذكي
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* منطقة الرسائل */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <p>مرحباً! أنا نورا المحسنة. كيف يمكنني مساعدتك اليوم؟</p>
                  <p className="text-sm mt-2">يمكنني التعلم وحفظ المعلومات وتحليل الوسائط</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      <p className="text-sm">نورا تفكر...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* أزرار الإجراءات السريعة */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => sendMessage('', 'scan')}
                disabled={loading}
              >
                <Scan className="h-4 w-4 mr-1" />
                فحص الخوادم
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={getStats}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                الإحصائيات
              </Button>
            </div>

            {/* نموذج الإرسال */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* الشريط الجانبي */}
      <div className="space-y-6">
        {/* إحصائيات النظام */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              إحصائيات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">المعرفة المحفوظة:</span>
                  <Badge variant="secondary">{stats.معرفة_محفوظة}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">الذكريات:</span>
                  <Badge variant="secondary">{stats.ذكريات}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">سجل المحادثات:</span>
                  <Badge variant="secondary">{stats.سجل_محادثات}</Badge>
                </div>
                <Separator />
                <p className="text-xs text-gray-500">
                  آخر تحديث: {stats.آخر_تحديث}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">اضغط على "الإحصائيات" لعرض البيانات</p>
            )}
          </CardContent>
        </Card>

        {/* تعليم المساعد */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              تعليم نورا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="الموضوع..."
              value={teachTopic}
              onChange={(e) => setTeachTopic(e.target.value)}
            />
            <Input
              placeholder="المحتوى..."
              value={teachContent}
              onChange={(e) => setTeachContent(e.target.value)}
            />
            <Button 
              onClick={teachAssistant}
              disabled={!teachTopic.trim() || !teachContent.trim()}
              className="w-full"
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              علّم نورا
            </Button>
            <p className="text-xs text-gray-500">
              يمكنك تعليم نورا معلومات جديدة لتحسين إجاباتها
            </p>
          </CardContent>
        </Card>

        {/* الميزات */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">الميزات المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                التعلم الذاتي
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                تحليل الوسائط
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                حفظ الذاكرة
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                كشف اللغة
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                فحص الخوادم
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
