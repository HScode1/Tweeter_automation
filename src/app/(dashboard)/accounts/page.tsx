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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent mb-3 tracking-tight">
          Comptes Connectés
        </h1>
        <p className="text-zinc-200 mb-8 text-lg">
          Gérez facilement vos connexions aux réseaux sociaux
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {accounts.map((account) => (
            <Card
              key={account.platform}
              className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              <CardHeader className="border-b border-zinc-700/50 bg-gradient-to-r from-[#6C5CE7]/10 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4 text-zinc-200">
                    <Icons.twitter className="h-7 w-7 text-[#6C5CE7]" />
                    <span className="text-xl font-semibold">Twitter</span>
                  </CardTitle>
                  {account.isConnected && (
                    <Badge className="bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/50 px-3 py-1 rounded-full font-medium">
                      Connecté
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6">
                {account.isConnected ? (
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    className="w-full bg-red-500/90 hover:bg-red-600 text-white transition-all duration-300 rounded-lg py-2 text-sm font-medium hover:shadow-lg hover:shadow-red-500/20"
                  >
                    Déconnecter le compte
                  </Button>
                ) : (
                  <Button
                    onClick={handleTwitterSignIn}
                    className="w-full bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white transition-all duration-300 rounded-lg py-2 text-sm font-medium hover:shadow-lg hover:shadow-[#6C5CE7]/20"
                  >
                    Connecter Twitter
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}