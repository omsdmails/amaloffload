
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SuggestionsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !suggestion.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          suggestion: suggestion.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "تم الإرسال بنجاح",
          description: "شكراً لك على اقتراحك القيم!",
        });
        
        // Reset form
        setName("");
        setEmail("");
        setSuggestion("");
      } else {
        throw new Error('Failed to submit suggestion');
      }
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الاقتراح. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-right">💡 اقتراحك يهمنا</CardTitle>
        <CardDescription className="text-right">
          ساعدنا في تطوير النظام بأفكارك ومقترحاتك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              الاسم *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="اكتب اسمك هنا"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">
              البريد الإلكتروني (اختياري)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestion" className="text-right block">
              الاقتراح *
            </Label>
            <Textarea
              id="suggestion"
              placeholder="شاركنا اقتراحك أو فكرتك لتحسين النظام..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="text-right min-h-[120px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "جارٍ الإرسال..." : "📤 إرسال الاقتراح"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
