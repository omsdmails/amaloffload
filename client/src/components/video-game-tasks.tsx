
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Play, Video, Gamepad2 } from 'lucide-react';

interface TaskResult {
  status: string;
  processing_time: number;
  [key: string]: any;
}

export function VideoGameTasks() {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TaskResult>>({});
  const [loading, setLoading] = useState(false);

  // إعدادات مهام الفيديو
  const [videoSettings, setVideoSettings] = useState({
    duration: 300,
    quality: 5,
    inputFormat: 'mp4',
    outputFormat: 'avi',
    effectsCount: 4,
    resolution: '1080p',
    compressionRatio: 0.5
  });

  // إعدادات مهام الألعاب
  const [gameSettings, setGameSettings] = useState({
    objectsCount: 200,
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    lightingQuality: 'high',
    textureQuality: 'ultra',
    framesCount: 500,
    physicsQuality: 'high',
    aiAgents: 30,
    decisionComplexity: 8,
    gameStateSize: 800
  });

  const executeTask = async (taskType: string, params: any) => {
    setLoading(true);
    setActiveTask(taskType);

    try {
      const response = await fetch('/api/execute-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType, params })
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, [taskType]: result }));
    } catch (error) {
      console.error('خطأ في تنفيذ المهمة:', error);
    } finally {
      setLoading(false);
      setActiveTask(null);
    }
  };

  const videoTasks = [
    {
      id: 'video_conversion',
      title: 'تحويل صيغة الفيديو',
      description: 'تحويل الفيديو بين صيغ مختلفة',
      icon: <Video className="h-5 w-5" />,
      color: 'bg-blue-500',
      execute: () => executeTask('video_format_conversion', [
        videoSettings.duration,
        videoSettings.quality,
        videoSettings.inputFormat,
        videoSettings.outputFormat
      ])
    },
    {
      id: 'video_effects',
      title: 'تأثيرات الفيديو',
      description: 'إضافة تأثيرات متقدمة للفيديو',
      icon: <Video className="h-5 w-5" />,
      color: 'bg-purple-500',
      execute: () => executeTask('video_effects_processing', [
        videoSettings.duration,
        videoSettings.effectsCount,
        videoSettings.resolution
      ])
    }
  ];

  const gameTasks = [
    {
      id: '3d_render',
      title: 'رندر ثلاثي الأبعاد',
      description: 'رندر مشهد ثلاثي الأبعاد متقدم',
      icon: <Gamepad2 className="h-5 w-5" />,
      color: 'bg-green-500',
      execute: () => executeTask('render_3d_scene', [
        gameSettings.objectsCount,
        gameSettings.resolutionWidth,
        gameSettings.resolutionHeight,
        gameSettings.lightingQuality,
        gameSettings.textureQuality
      ])
    },
    {
      id: 'physics_sim',
      title: 'محاكاة الفيزياء',
      description: 'محاكاة فيزياء متقدمة للألعاب',
      icon: <Gamepad2 className="h-5 w-5" />,
      color: 'bg-orange-500',
      execute: () => executeTask('physics_simulation', [
        gameSettings.objectsCount,
        gameSettings.framesCount,
        gameSettings.physicsQuality
      ])
    },
    {
      id: 'game_ai',
      title: 'ذكاء اصطناعي للألعاب',
      description: 'معالجة الذكاء الاصطناعي للعبة',
      icon: <Gamepad2 className="h-5 w-5" />,
      color: 'bg-red-500',
      execute: () => executeTask('game_ai_processing', [
        gameSettings.aiAgents,
        gameSettings.decisionComplexity,
        gameSettings.gameStateSize
      ])
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إعدادات مهام الفيديو */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              إعدادات معالجة الفيديو
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">مدة الفيديو (ثانية)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={videoSettings.duration}
                  onChange={(e) => setVideoSettings(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 300 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="quality">مستوى الجودة (1-10)</Label>
                <Input
                  id="quality"
                  type="number"
                  min="1"
                  max="10"
                  value={videoSettings.quality}
                  onChange={(e) => setVideoSettings(prev => ({ 
                    ...prev, 
                    quality: parseInt(e.target.value) || 5 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inputFormat">صيغة الدخل</Label>
                <Select
                  value={videoSettings.inputFormat}
                  onValueChange={(value) => setVideoSettings(prev => ({ 
                    ...prev, 
                    inputFormat: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="mkv">MKV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="outputFormat">صيغة الإخراج</Label>
                <Select
                  value={videoSettings.outputFormat}
                  onValueChange={(value) => setVideoSettings(prev => ({ 
                    ...prev, 
                    outputFormat: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="avi">AVI</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="mkv">MKV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="resolution">دقة الفيديو</Label>
              <Select
                value={videoSettings.resolution}
                onValueChange={(value) => setVideoSettings(prev => ({ 
                  ...prev, 
                  resolution: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* إعدادات مهام الألعاب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              إعدادات الألعاب ثلاثية الأبعاد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="objectsCount">عدد الكائنات</Label>
                <Input
                  id="objectsCount"
                  type="number"
                  value={gameSettings.objectsCount}
                  onChange={(e) => setGameSettings(prev => ({ 
                    ...prev, 
                    objectsCount: parseInt(e.target.value) || 200 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="framesCount">عدد الإطارات</Label>
                <Input
                  id="framesCount"
                  type="number"
                  value={gameSettings.framesCount}
                  onChange={(e) => setGameSettings(prev => ({ 
                    ...prev, 
                    framesCount: parseInt(e.target.value) || 500 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resWidth">عرض الدقة</Label>
                <Input
                  id="resWidth"
                  type="number"
                  value={gameSettings.resolutionWidth}
                  onChange={(e) => setGameSettings(prev => ({ 
                    ...prev, 
                    resolutionWidth: parseInt(e.target.value) || 1920 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="resHeight">ارتفاع الدقة</Label>
                <Input
                  id="resHeight"
                  type="number"
                  value={gameSettings.resolutionHeight}
                  onChange={(e) => setGameSettings(prev => ({ 
                    ...prev, 
                    resolutionHeight: parseInt(e.target.value) || 1080 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lightingQuality">جودة الإضاءة</Label>
              <Select
                value={gameSettings.lightingQuality}
                onValueChange={(value) => setGameSettings(prev => ({ 
                  ...prev, 
                  lightingQuality: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="ultra">فائقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مهام الفيديو */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            مهام معالجة الفيديو
          </CardTitle>
          <CardDescription>
            مهام متقدمة لمعالجة وتحويل الفيديو
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoTasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${task.color} text-white`}>
                        {task.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={task.execute}
                    disabled={loading}
                    className="w-full"
                  >
                    {activeTask === task.id ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                        جاري التنفيذ...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        تنفيذ المهمة
                      </>
                    )}
                  </Button>

                  {results[task.id] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          {results[task.id].status === 'success' ? 'نجح' : 'فشل'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {results[task.id].processing_time?.toFixed(2)}s
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {results[task.id].server_processed && '✅ تم على الخادم'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مهام الألعاب */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            مهام الألعاب ثلاثية الأبعاد
          </CardTitle>
          <CardDescription>
            مهام متقدمة للرندر والمحاكاة والذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gameTasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${task.color} text-white`}>
                        {task.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{task.title}</h3>
                        <p className="text-xs text-gray-600">{task.description}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={task.execute}
                    disabled={loading}
                    className="w-full"
                    size="sm"
                  >
                    {activeTask === task.id ? (
                      <>
                        <AlertCircle className="mr-2 h-3 w-3 animate-spin" />
                        تنفيذ...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-3 w-3" />
                        تنفيذ
                      </>
                    )}
                  </Button>

                  {results[task.id] && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {results[task.id].status === 'success' ? 'نجح' : 'فشل'}
                        </Badge>
                        <span className="text-gray-600">
                          {results[task.id].processing_time?.toFixed(2)}s
                        </span>
                      </div>
                      {results[task.id].estimated_fps && (
                        <div className="text-xs text-gray-500 mt-1">
                          FPS: {results[task.id].estimated_fps}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
