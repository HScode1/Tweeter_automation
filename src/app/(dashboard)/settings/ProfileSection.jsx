"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default ProfileSection;
