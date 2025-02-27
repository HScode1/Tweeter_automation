"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const ImportSection = () => {
  const [autoImport, setAutoImport] = useState(false);
  const [importSource, setImportSource] = useState("");

  const saveImportSettings = async () => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          autoImport,
          importSource: autoImport ? importSource : null,
        }),
      });
      
      if (response.ok) {
        toast.success("Paramètres d'importation mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour des paramètres");
      }
    } catch (error) {
      console.error("Error saving import settings:", error);
      toast.error("Erreur lors de la mise à jour des paramètres");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importation automatique</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={autoImport}
            onCheckedChange={setAutoImport}
            id="auto-import"
          />
          <label htmlFor="auto-import">Activer l'importation automatique</label>
        </div>
        
        {autoImport && (
          <div className="space-y-2">
            <label>Source d'importation (URL RSS ou API)</label>
            <Input
              value={importSource}
              onChange={(e) => setImportSource(e.target.value)}
              placeholder="https://example.com/feed.rss"
            />
          </div>
        )}
        
        <Button onClick={saveImportSettings}>Enregistrer les paramètres</Button>
      </CardContent>
    </Card>
  );
};

export default ImportSection;
