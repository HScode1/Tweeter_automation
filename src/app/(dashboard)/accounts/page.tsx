"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClerk, useUser } from "@clerk/nextjs";
import { Icons } from "@/components/icons";

interface AccountData {
  platform: string;
  // Add other properties that might come from the API
}

export default function AccountsPage() {
  const { openSignIn } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [accounts, setAccounts] = useState<{ platform: string; isConnected: boolean }[]>([
    { platform: "twitter", isConnected: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoaded && user) {
      fetchAccounts();
    }
  }, [isUserLoaded, user]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/accounts");
      const data = await response.json();
      
      // Log pour déboguer
      console.log("Données reçues de l'API:", data);

      // Vérifier si data est un tableau
      const accountsData = Array.isArray(data) ? data : [];
      
      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          isConnected: accountsData.some((d: AccountData) => d.platform === acc.platform),
        }))
      );
    } catch (error) {
      console.error("Erreur lors du chargement des comptes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      await openSignIn({
        redirectUrl: "/dashboard",
        appearance: {
          elements: {
            socialButtonsBlockButton: "twitter",
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la connexion Twitter:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });

      if (response.ok) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Connexion requise</h2>
              <p className="text-gray-600 mb-4">
                Vous devez être connecté pour gérer vos comptes sociaux.
              </p>
              <Button onClick={() => openSignIn()}>Se connecter</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comptes connectés</h1>
          <p className="text-gray-600">Gérez vos comptes de réseaux sociaux</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.platform}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {account.platform === "twitter" && <Icons.twitter className="h-5 w-5" />}
                    Twitter
                  </CardTitle>
                  {account.isConnected && (
                    <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {account.isConnected ? (
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    className="w-full"
                  >
                    Déconnecter
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleTwitterSignIn}
                    className="w-full"
                  >
                    Connecter avec Twitter
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
