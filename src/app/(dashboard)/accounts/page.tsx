"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import Image from "next/image";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  profileImage: string;
  isConnected: boolean;
}

export default function AccountsPage() {
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
    // {
    //   id: "3",
    //   platform: "youtube",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "4",
    //   platform: "tiktok",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "5",
    //   platform: "facebook",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "6",
    //   platform: "linkedin",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "7",
    //   platform: "bluesky",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "8",
    //   platform: "threads",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
    // {
    //   id: "9",
    //   platform: "pinterest",
    //   username: "",
    //   profileImage: "",
    //   isConnected: false,
    // },
  ]);

  const handleConnect = async (platform: string) => {
    // Ici, nous simulerons la connexion. Dans une vraie application,
    // cela déclencherait le flux OAuth avec le réseau social correspondant
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
        setAccounts(accounts.map(account => {
          if (account.platform === platform) {
            return {
              ...account,
              username: response.data.username,
              profileImage: response.data.profileImage,
              isConnected: true,
            };
          }
          return account;
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
    }
  };

  const handleDisconnect = (platform: string) => {
    setAccounts(accounts.map(account => {
      if (account.platform === platform) {
        return {
          ...account,
          username: "",
          profileImage: "",
          isConnected: false,
        };
      }
      return account;
    }));
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
    </div>
  </div>
  );
}
