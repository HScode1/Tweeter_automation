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
    <Card>
      <CardHeader>
        <CardTitle>Profil Utilisateur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <UserButton />
          <div>
            <p><strong>Email :</strong> {user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="space-y-2">
          <label>Nom d'utilisateur</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleUpdate}>Mettre à jour</Button>
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
    <Card>
      <CardHeader>
        <CardTitle>Authentification à deux facteurs</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Statut : {is2FAEnabled ? "Activée" : "Désactivée"}</p>
        <Button onClick={handleToggle2FA}>
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
    <Card>
      <CardHeader>
        <CardTitle>Sessions actives</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.map((session) => (
          <div key={session.id} className="flex justify-between items-center mb-2">
            <p>{session.device || "Appareil inconnu"} - {new Date(session.lastActiveAt).toLocaleString()}</p>
            <Button variant="destructive" onClick={() => handleSignOut(session.id)}>
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
    <Card>
      <CardHeader>
        <CardTitle>Fuseau horaire</CardTitle>
      </CardHeader>
      <CardContent>
        <select 
          value={timezone} 
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
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
    <Card>
      <CardHeader>
        <CardTitle>Thème</CardTitle>
      </CardHeader>
      <CardContent>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
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
    <Card>
      <CardHeader>
        <CardTitle>Supprimer le compte</CardTitle>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Supprimer mon compte</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Toutes vos données seront supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Paramètres</h1>
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