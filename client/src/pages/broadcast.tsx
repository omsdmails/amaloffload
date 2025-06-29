import { BroadcastMessage } from "@/components/broadcast-message";

export default function BroadcastPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          نظام الرسائل الجماعية
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          إرسال رسائل فورية إلى جميع الأجهزة المتصلة في الشبكة الموزعة
        </p>
      </div>
      
      <BroadcastMessage />
    </div>
  );
}