import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircleIcon, ClockIcon, SendIcon, UsersIcon } from "lucide-react";

interface BroadcastMessage {
  id: number;
  message: string;
  senderNode: string;
  timestamp: string;
  delivered: boolean;
  recipients: string[];
}

export function GroupChat() {
  const [message, setMessage] = useState("");
  const [senderNode, setSenderNode] = useState("dashboard-admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prevMessagesCount = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<BroadcastMessage[]>({
    queryKey: ["/api/broadcast"],
    refetchInterval: 2000, // Auto-refresh every 2 seconds for chat-like experience
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: { message: string; senderNode: string }) => {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/broadcast"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الإرسال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor for new messages and show notification
  useEffect(() => {
    if (messages.length > prevMessagesCount.current && prevMessagesCount.current > 0) {
      const newMessage = messages[messages.length - 1];
      if (newMessage.senderNode !== senderNode) {
        toast({
          title: "رسالة جديدة وصلت",
          description: `من: ${newMessage.senderNode}`,
          variant: "default",
        });
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages, toast, senderNode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendBroadcastMutation.mutate({ message: message.trim(), senderNode });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const activeDevicesCount = messages.length > 0 && messages[messages.length - 1]?.recipients?.length || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="h-5 w-5 text-green-600" />
            الدردشة الجماعية للأجهزة المتصلة
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {activeDevicesCount} جهاز متصل • {messages.length} رسالة
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Messages Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>لا توجد رسائل بعد. ابدأ المحادثة!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.senderNode === senderNode ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {getAvatarInitials(msg.senderNode)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex flex-col max-w-[70%] ${
                        msg.senderNode === senderNode ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {msg.senderNode}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          msg.senderNode === senderNode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {msg.delivered ? (
                          <CheckCircleIcon className="h-3 w-3 text-green-500" />
                        ) : (
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {msg.delivered ? `تم الإرسال للـ ${msg.recipients?.length || 0} جهاز` : 'جاري الإرسال...'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Input Area */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={senderNode}
                onChange={(e) => setSenderNode(e.target.value)}
                placeholder="اسمك"
                className="w-32"
                required
              />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا... (اضغط Enter للإرسال)"
                rows={2}
                className="resize-none flex-1"
                required
              />
              <Button
                type="submit"
                disabled={sendBroadcastMutation.isPending || !message.trim()}
                size="default"
                className="px-6"
              >
                {sendBroadcastMutation.isPending ? (
                  <>
                    <ClockIcon className="h-4 w-4 ml-2" />
                    جاري الإرسال
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4 ml-2" />
                    إرسال
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}