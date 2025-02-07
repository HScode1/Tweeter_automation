"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");
  const [content, setContent] = useState("");

  const handleSchedule = async () => {
    if (!date || !content) return;

    const scheduledDateTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    scheduledDateTime.setHours(hours, minutes);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        // Reset form
        setContent("");
        setDate(new Date());
        setTime("12:00");
        alert("Tweet programmé avec succès!");
      }
    } catch (error) {
      console.error("Erreur lors de la programmation:", error);
      alert("Erreur lors de la programmation du tweet");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Planifier un Tweet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Date et Heure</CardTitle>
            <CardDescription>
              Choisissez quand votre tweet sera publié
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={fr}
              className="mb-4"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenu du Tweet</CardTitle>
            <CardDescription>
              Écrivez votre tweet (280 caractères max)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Que voulez-vous tweeter ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] mb-4"
              maxLength={280}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {280 - content.length} caractères restants
              </span>
              <Button onClick={handleSchedule}>
                Programmer pour {date ? format(date, "d MMMM yyyy", { locale: fr }) : "..."} à {time}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
