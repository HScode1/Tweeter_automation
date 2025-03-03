"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { zonedTimeToUtc } from "date-fns-tz";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProfileSection = () => {
  const { user } = useUser();
  const [username, setUsername] = useState(user?.fullName || "");

  const handleUpdate = async () => {
    await user?.update({ firstName: username });
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Profil Utilisateur</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <UserButton />
          <div>
            <p className="text-zinc-200"><strong>Email :</strong> {user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-200">Nom d'utilisateur</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-2 border-zinc-600 rounded-xl bg-zinc-700/70 text-white focus:ring-0 focus:border-[#6C5CE7] transition-colors duration-200"
          />
          <Button 
            onClick={handleUpdate}
            className="bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-full py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20"
          >
            Mettre à jour
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TwoFASection = () => {
  const { user } = useUser();
  const is2FAEnabled = user?.twoFactorEnabled;

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      await user?.update({ twoFactorEnabled: false });
    } else {
      // Redirige vers le flux d'activation de Clerk
      window.location.href = "/2fa/setup";
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Authentification à deux facteurs</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-zinc-200 mb-4">Statut : {is2FAEnabled ? "Activée" : "Désactivée"}</p>
        <Button 
          onClick={handleToggle2FA}
          className={is2FAEnabled 
            ? "border-[#6C5CE7]/50 text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-full py-2 transition-all duration-300" 
            : "bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-full py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20"
          }
        >
          {is2FAEnabled ? "Désactiver" : "Activer"} le 2FA
        </Button>
      </CardContent>
    </Card>
  );
};

const SessionsSection = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const sessions = user?.activeSessions || [];

  const handleSignOut = async (sessionId) => {
    await signOut({ sessionId });
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Sessions actives</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {sessions.map((session) => (
          <div key={session.id} className="flex justify-between items-center mb-4 p-3 border border-zinc-600 bg-zinc-700/50 backdrop-blur-sm rounded-xl">
            <p className="text-zinc-200">{session.device || "Appareil inconnu"} - {new Date(session.lastActiveAt).toLocaleString()}</p>
            <Button 
              variant="destructive" 
              onClick={() => handleSignOut(session.id)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full py-1 px-3 transition-all duration-300"
            >
              Déconnecter
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const TimezoneSection = () => {
  const [timezone, setTimezone] = useState("Europe/Paris");

  const handleChange = (e) => {
    setTimezone(e.target.value);
    // Sauvegardez dans la DB via Prisma
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Fuseau horaire</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <select 
          value={timezone} 
          onChange={handleChange}
          className="w-full p-2 border-2 border-zinc-600 rounded-xl bg-zinc-700/70 text-white focus:ring-0 focus:border-[#6C5CE7] transition-colors duration-200"
        >
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="Australia/Sydney">Australia/Sydney</option>
          <option value="Africa/Cairo">Africa/Cairo</option>
        </select>
      </CardContent>
    </Card>
  );
};

const ThemeSection = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Thème</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 border-2 border-zinc-600 rounded-xl bg-zinc-700/70 text-white focus:ring-0 focus:border-[#6C5CE7] transition-colors duration-200"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="system">Système</option>
        </select>
      </CardContent>
    </Card>
  );
};

const DeleteAccountSection = () => {
  const { user } = useUser();

  const handleDelete = async () => {
    await user?.delete();
    window.location.href = "/"; // Redirection après suppression
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl border-b border-zinc-700/50">
        <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Supprimer le compte</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full py-2 transition-all duration-300"
            >
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#6C5CE7] text-xl font-semibold">Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-300">
                Cette action est irréversible. Toutes vos données seront supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#6C5CE7]/50 text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-full py-2 transition-all duration-300">Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full py-2 transition-all duration-300"
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
          Paramètres
        </h1>
        <ProfileSection />
        <TwoFASection />
        <SessionsSection />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimezoneSection />
          <ThemeSection />
        </div>
        <DeleteAccountSection />
      </div>
    </div>
  );
}