"use client"
import React, { useState, useEffect } from "react";
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
import { Clock, Calendar as CalendarIcon } from "lucide-react";

interface ScheduledTweet {
  id: string;
  content: string;
  scheduledFor: string;
  status: 'pending' | 'published' | 'failed';
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");
  const [content, setContent] = useState("");
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([]);

  // Charger les tweets programmés au chargement de la page
  useEffect(() => {
    fetchScheduledTweets();
  }, []);

  const fetchScheduledTweets = async () => {
    try {
      const response = await fetch("/api/scheduled-tweets");
      if (response.ok) {
        const data = await response.json();
        setScheduledTweets(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tweets programmés:", error);
    }
  };

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
        // Recharger la liste des tweets programmés
        fetchScheduledTweets();
        alert("Tweet programmé avec succès!");
      }
    } catch (error) {
      console.error("Erreur lors de la programmation:", error);
      alert("Erreur lors de la programmation du tweet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Planifier un Tweet</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
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
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
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

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tweets Programmés</CardTitle>
            <CardDescription>
              Liste de vos tweets en attente de publication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledTweets.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Aucun tweet programmé
                </p>
              ) : (
                scheduledTweets
                  .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                  .map((tweet) => (
                    <div
                      key={tweet.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <p className="font-medium">{tweet.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {format(new Date(tweet.scheduledFor), "d MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <span className={`font-medium ${getStatusColor(tweet.status)}`}>
                          {tweet.status === 'pending' && 'En attente'}
                          {tweet.status === 'published' && 'Publié'}
                          {tweet.status === 'failed' && 'Échec'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}