"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamically import the TweetCard component
const TweetCard = dynamic(() => import('@/components/dashboard/TweetCard'), {
  loading: () => (
    <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-pulse">
      <CardContent className="p-6 h-40"></CardContent>
    </Card>
  )
});

interface Media {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "GIF";
}

interface TweetMetrics {
  impressions: number;
  engagements: number;
}

interface Tweet {
  id: string;
  content: string;
  scheduledFor: string;
  status: "PENDING" | "PUBLISHED" | "FAILED" | "SCHEDULED";
  createdAt: string;
  tweetId?: string;
  errorMessage?: string;
  retryCount: number;
  media?: Media[];
  metrics?: TweetMetrics;
}

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/scheduled-tweets");
      if (response.ok) {
        const data = await response.json();
        setTweets(data);
      } else {
        console.error("Erreur lors du chargement des tweets:", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tweets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Tweet["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-green-900/20 text-green-400 border border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" /> Publié
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-900/20 text-red-400 border border-red-500/50">
            <XCircle className="w-3 h-3 mr-1" /> Échoué
          </Badge>
        );
      case "PENDING":
      case "SCHEDULED":
        return (
          <Badge className="bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/50">
            <Clock className="w-3 h-3 mr-1" /> En attente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
              Vos Tweets
            </h1>
            <p className="text-zinc-200">Gérez vos tweets publiés et programmés</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20"
          >
            <Link href="/schedule">Programmer un nouveau tweet</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {tweets.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <p className="text-zinc-200">Aucun tweet pour le moment</p>
                <Button
                  asChild
                  variant="link"
                  className="mt-2 text-[#6C5CE7] hover:text-[#8E7CF8]"
                >
                  <Link href="/schedule">Programmer votre premier tweet</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            tweets
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((tweet) => (
                <TweetCard 
                  key={tweet.id} 
                  tweet={tweet} 
                  getStatusBadge={getStatusBadge} 
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}