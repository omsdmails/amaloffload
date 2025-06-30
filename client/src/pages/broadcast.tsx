import { GroupChat } from "@/components/group-chat";
import { SuggestionsForm } from "@/components/suggestions-form";
import { EnhancedAIChat } from "@/components/enhanced-ai-chat";

export default function BroadcastPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        {/* الدردشة الجماعية */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            الدردشة الجماعية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تواصل مباشر وفوري مع جميع الأجهزة المتصلة في الشبكة الموزعة
          </p>

          <div className="mt-6">
            <GroupChat />
          </div>
        </div>

        {/* المساعد الذكي المحسن */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🤖 نورا المحسنة - المساعد الذكي
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            مساعد ذكي متقدم مع قدرات التعلم الذاتي وتحليل الوسائط
          </p>

          <div className="mt-6">
            <EnhancedAIChat />
          </div>
        </div>

        {/* نموذج الاقتراحات */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📝 أرسل اقتراحك
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            شاركنا أفكارك وآرائك لتحسين النظام!
          </p>

          <div className="mt-6">
            <SuggestionsForm />
          </div>
        </div>
      </div>
    </div>
  );
}
