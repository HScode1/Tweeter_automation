"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  profileImage?: string;
  isConnected: boolean;
}

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    {
      id: "1",
      platform: "twitter",
      username: "",
      profileImage: "",
      isConnected: false,
    },
    {
      id: "2",
      platform: "instagram",
      username: "",
      profileImage: "",
      isConnected: false,
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les comptes depuis l'API
  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!session?.user) {
        setError("Vous devez être connecté pour voir vos comptes");
        return;
      }

      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      
      // Transformer les données de l'API au format attendu par le composant
      const connectedAccounts = accounts.map(account => {
        const connectedAccount = data.find((a: any) => a.platform === account.platform);
        if (connectedAccount) {
          return {
            ...account,
            id: connectedAccount.id,
            username: connectedAccount.username,
            isConnected: true,
          };
        }
        return account;
      });
      
      setAccounts(connectedAccounts);
    } catch (error) {
      setError("Erreur lors du chargement des comptes");
      console.error("Erreur lors du chargement des comptes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les comptes au montage du composant et quand la session change
  useEffect(() => {
    if (status === "authenticated") {
      loadAccounts();
    }
  }, [status]);

  const handleConnect = async (platform: string) => {
    // TODO: Implémenter la connexion OAuth avec le réseau social
    const mockConnect = async () => {
      return {
        success: true,
        data: {
          username: "johndoe",
          profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        },
      };
    };

    try {
      const response = await mockConnect();
      if (response.success) {
        // Recharger les comptes après la connexion
        await loadAccounts();
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disconnect' }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      // Recharger les comptes après la déconnexion
      await loadAccounts();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const Icon = Icons[platform as keyof typeof Icons];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  const getPlatformName = (platform: string) => {
    const names: { [key: string]: string } = {
      twitter: "Twitter/X",
      instagram: "Instagram",
      youtube: "YouTube",
      tiktok: "TikTok",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      bluesky: "Bluesky",
      threads: "Threads",
      pinterest: "Pinterest",
    };
    return names[platform] || platform;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
            Comptes connectés
          </h1>
          <p className="text-zinc-500">Gérez vos comptes de réseaux sociaux connectés</p>
        </div>

        {status === "loading" || isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
          </div>
        ) : status === "unauthenticated" ? (
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">
              Vous devez être connecté pour voir vos comptes.
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="border-[#6C5CE7] bg-[#6C5CE7]/10">
              <AlertDescription className="text-[#6C5CE7]">
                Connectez vos comptes de réseaux sociaux pour commencer à publier du contenu automatiquement.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card key={account.id} className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(account.platform)}
                      <CardTitle className="text-sm font-medium">{getPlatformName(account.platform)}</CardTitle>
                    </div>
                    {account.isConnected && (
                      <Badge variant="secondary" className="bg-[#6C5CE7] text-white text-xs">
                        Connecté
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {account.isConnected ? (
                      <div className="flex items-center space-x-4">
                        <Image
                          src={account.profileImage || "/placeholder.svg"}
                          alt={`${account.username} avatar`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">@{account.username}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-0"
                            onClick={() => handleDisconnect(account.platform)}
                          >
                            Déconnecter
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
                        onClick={() => handleConnect(account.platform)}
                      >
                        Connecter {getPlatformName(account.platform)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
