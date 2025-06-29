import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, Tag } from "lucide-react";

export function SecurityPanel() {
  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">Security Status</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <Badge variant="outline" className="text-green-400 border-green-400">
            Secured
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium mb-1">Encryption</h4>
            <p className="text-sm text-gray-400">All traffic encrypted</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium mb-1">Authentication</h4>
            <p className="text-sm text-gray-400">Digital signatures active</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium mb-1">Network Security</h4>
            <p className="text-sm text-gray-400">Secure peer discovery</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
