"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const TwoFASection = () => {
  const { user } = useClerk();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleToggle2FA = async (checked) => {
    setTwoFAEnabled(checked);
    if (checked && !showQRCode) {
      setShowQRCode(true);
      // In a real implementation, you would call Clerk API to enable 2FA
    } else if (!checked) {
      setShowQRCode(false);
      // In a real implementation, you would call Clerk API to disable 2FA
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentification à deux facteurs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={twoFAEnabled}
            onCheckedChange={handleToggle2FA}
            id="two-fa"
          />
          <label htmlFor="two-fa">Activer l'authentification à deux facteurs</label>
        </div>
        
        {showQRCode && (
          <div className="space-y-4">
            <p>Scannez ce QR code avec votre application d'authentification :</p>
            <div className="bg-gray-200 dark:bg-gray-700 w-48 h-48 mx-auto flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">QR Code Placeholder</p>
            </div>
            <Button onClick={() => setShowQRCode(false)}>J'ai scanné le code</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFASection;
