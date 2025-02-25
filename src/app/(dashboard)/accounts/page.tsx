"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { Icons } from "@/components/icons";

export default function AccountsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [accounts, setAccounts] = useState<{ platform: string; isConnected: boolean }[]>([
    { platform: "twitter", isConnected: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoaded && user) fetchAccounts();
  }, [isUserLoaded, user]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/accounts");
      const { accounts } = await response.json();
      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          isConnected: accounts.some((d: { platform: string }) => d.platform === acc.platform),
        }))
      );
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterSignIn = () => {
    window.location.href = '/api/oauth/x/redirect';
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      if (response.ok) await fetchAccounts();
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8E7CF8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Connected Accounts
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Manage your social media connections with ease
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {accounts.map((account) => (
            <Card 
              key={account.platform} 
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
            >
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#8E7CF8]/10 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4 text-gray-900 dark:text-white">
                    <Icons.twitter className="h-7 w-7 text-[#8E7CF8]" />
                    <span className="text-xl font-semibold">Twitter</span>
                  </CardTitle>
                  {account.isConnected && (
                    <Badge className="bg-[#8E7CF8]/20 text-[#8E7CF8] dark:bg-[#8E7CF8]/30 dark:text-white px-3 py-1 rounded-full font-medium">
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6">
                {account.isConnected ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect} 
                    className="w-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 rounded-lg py-2 text-sm font-medium hover:scale-105"
                  >
                    Disconnect Account
                  </Button>
                ) : (
                  <Button 
                    onClick={handleTwitterSignIn} 
                    className="w-full bg-[#8E7CF8] hover:bg-[#8E7CF8]/90 text-white transition-all duration-300 rounded-lg py-2 text-sm font-medium hover:scale-105"
                  >
                    Connect Twitter
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};