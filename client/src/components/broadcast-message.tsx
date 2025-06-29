import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BroadcastMessage {
  id: number;
  message: string;
  senderNode: string;
  timestamp: string;
  delivered: boolean;
  recipients: string[];
}

export function BroadcastMessage() {
  const [message, setMessage] = useState("");
  const [senderNode, setSenderNode] = useState("dashboard-admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<BroadcastMessage[]>({
    queryKey: ["/api/broadcast"],
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
      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "تم إرسال الرسالة إلى جميع الأجهزة المتصلة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/broadcast"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة رسالة قبل الإرسال",
        variant: "destructive",
      });
      return;
    }
    sendBroadcastMutation.mutate({ message: message.trim(), senderNode });
  };

  return (
    <div className="space-y-6">
      {/* Send New Message Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadioIcon className="h-5 w-5 text-blue-600" />
            إرسال رسالة جماعية
          </CardTitle>
          <CardDescription>
            أرسل رسالة إلى جميع الأجهزة المتصلة في الشبكة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderNode">المرسل</Label>
              <Input
                id="senderNode"
                value={senderNode}
                onChange={(e) => setSenderNode(e.target.value)}
                placeholder="اسم المرسل"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={sendBroadcastMutation.isPending}
              className="w-full"
            >
              {sendBroadcastMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Message History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-gray-600" />
            سجل الرسائل المرسلة
          </CardTitle>
          <CardDescription>
            عرض آخر الرسائل الجماعية المرسلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لم يتم إرسال أي رسائل بعد
            </div>
          ) : (
            <div className="space-y-4">
              {messages.slice().reverse().map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {msg.senderNode}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {msg.delivered ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {msg.delivered ? "تم التسليم" : "في الانتظار"}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 p-3 rounded border">
                    {msg.message}
                  </p>
                  
                  {msg.recipients && msg.recipients.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        تم الإرسال إلى ({msg.recipients.length}) جهاز:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.recipients.map((recipient, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}