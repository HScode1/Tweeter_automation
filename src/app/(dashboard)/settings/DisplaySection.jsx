"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DisplaySection = () => {
  const [tweetsPerPage, setTweetsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("chrono");

  const savePreferences = async () => {
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweetsPerPage,
          sortOrder,
        }),
      });
      
      if (response.ok) {
        toast.success("Préférences d'affichage mises à jour");
      } else {
        toast.error("Erreur lors de la mise à jour des préférences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erreur lors de la mise à jour des préférences");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences d'affichage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label>Tweets par page</label>
          <div className="flex items-center space-x-4">
            <Slider
              value={[tweetsPerPage]}
              min={5}
              max={50}
              step={5}
              onValueChange={(values) => setTweetsPerPage(values[0])}
              className="flex-1"
            />
            <span className="w-12 text-center">{tweetsPerPage}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <label>Ordre de tri</label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un ordre de tri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chrono">Chronologique (plus récent d'abord)</SelectItem>
              <SelectItem value="reverse">Chronologique inversé (plus ancien d'abord)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={savePreferences}>Enregistrer les préférences</Button>
      </CardContent>
    </Card>
  );
};

export default DisplaySection;
