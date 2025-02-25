"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function TweetComposerPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tweetContent, setTweetContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const maxChars = 280;

  useEffect(() => {
    setCharCount(tweetContent.length);
  }, [tweetContent]);

  const handlePublish = async () => {
    if (!tweetContent.trim()) {
      setMessage({ type: "error", text: "Le tweet ne peut pas être vide." });
      return;
    }
    if (charCount > maxChars) {
      setMessage({ type: "error", text: "Le tweet dépasse la limite de 280 caractères." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const endpoint = isScheduling ? "/api/schedule-tweet" : "/api/post-tweet";
      const body = isScheduling
        ? {
            content: tweetContent,
            scheduledAt: scheduleDate && scheduleTime 
              ? `${format(scheduleDate, "yyyy-MM-dd")}T${scheduleTime}:00` 
              : null,
          }
        : { content: tweetContent };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la publication");
      }

      const result = await response.json();
      
      setMessage({
        type: "success",
        text: isScheduling ? "Tweet programmé avec succès !" : "Tweet publié avec succès !",
      });
      setTweetContent("");
      setScheduleDate(null);
      setScheduleTime("");
      setIsScheduling(false);
      
      // Refresh the page data if needed
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTwitter = () => {
    window.location.href = '/api/oauth/x/authorize';
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] to-white">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-zinc-600 mb-4">Veuillez vous connecter pour publier un tweet.</p>
            <Button className="bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:opacity-90 text-white rounded-full px-6 py-2 transition-all duration-300">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
          Créer un Tweet
        </h1>

        <Card className="border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent rounded-t-2xl">
            <CardTitle className="text-[#6C5CE7] text-xl font-semibold">
              Composer votre tweet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Tweet Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Contenu du tweet
              </Label>
              <Textarea
                placeholder="Quoi de neuf ?"
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                disabled={isLoading}
                className="min-h-[120px] border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-0 focus:border-[#6C5CE7] resize-none transition-colors duration-200"
              />
              <div className="flex justify-between text-sm">
                <span
                  className={cn(
                    "text-zinc-500 dark:text-zinc-400",
                    charCount > maxChars && "text-red-500"
                  )}
                >
                  {charCount}/{maxChars}
                </span>
                {charCount > maxChars && (
                  <span className="text-red-500">Dépassement de la limite</span>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Aperçu
              </Label>
              <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {user.fullName || "Utilisateur"}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">@{user.username || "user"}</p>
                    <p className="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                      {tweetContent || "Votre tweet apparaîtra ici..."}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setIsScheduling(!isScheduling)}
                className="w-full border-[#6C5CE7]/50 text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-full py-2 transition-all duration-300"
              >
                {isScheduling ? "Annuler la programmation" : "Programmer le tweet"}
              </Button>
              {isScheduling && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Date
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={scheduleDate ? format(scheduleDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => setScheduleDate(e.target.value ? new Date(e.target.value) : null)}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-0 focus:border-[#6C5CE7] transition-colors duration-200"
                        disabled={isLoading}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Heure
                    </Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-0 focus:border-[#6C5CE7] transition-colors duration-200"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handlePublish}
                disabled={isLoading || charCount > maxChars}
                className="flex-1 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:opacity-90 text-white rounded-full py-2 transition-all duration-300"
              >
                {isLoading
                  ? "En cours..."
                  : isScheduling
                  ? "Programmer"
                  : "Publier maintenant"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTweetContent("")}
                disabled={isLoading}
                className="border-[#6C5CE7]/50 text-[#6C5CE7] hover:bg-[#6C5CE7]/10 rounded-full py-2 transition-all duration-300"
              >
                Réinitialiser
              </Button>
            </div>

            {/* Message */}
            {message && (
              <p
                className={cn(
                  "text-sm text-center",
                  message.type === "success" ? "text-green-500" : "text-red-500"
                )}
              >
                {message.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}