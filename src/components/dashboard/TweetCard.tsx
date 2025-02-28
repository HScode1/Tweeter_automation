import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Twitter, AlertCircle, ExternalLink } from "lucide-react";

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

interface TweetCardProps {
  tweet: Tweet;
  getStatusBadge: (status: Tweet["status"]) => React.ReactNode;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, getStatusBadge }) => {
  return (
    <Card
      className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
    >
      <CardHeader className="border-b border-zinc-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getStatusBadge(tweet.status)}
            <span className="text-sm text-zinc-300">
              {format(new Date(tweet.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
            </span>
          </div>
          {tweet.status === "PUBLISHED" && tweet.tweetId && (
            <a
              href={`https://twitter.com/i/web/status/${tweet.tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6C5CE7] hover:text-[#8E7CF8] flex items-center text-sm transition-colors duration-200"
            >
              <Twitter className="w-4 h-4 mr-1" />
              Voir sur Twitter
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="mb-4">
          <p className="text-zinc-200 whitespace-pre-wrap">{tweet.content}</p>

          {tweet.media && tweet.media.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tweet.media.map((media) => (
                <div key={media.id} className="relative rounded-md overflow-hidden">
                  {media.type === "IMAGE" && (
                    <img
                      src={media.url}
                      alt="Media"
                      className="w-full h-auto object-cover rounded-md"
                    />
                  )}
                  {media.type === "VIDEO" && (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-auto rounded-md"
                    />
                  )}
                  {media.type === "GIF" && (
                    <img
                      src={media.url}
                      alt="GIF"
                      className="w-full h-auto object-cover rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-4 pt-4 border-t border-zinc-700/50">
          <div className="flex items-center text-sm text-zinc-300 mb-2 sm:mb-0">
            <Calendar className="w-4 h-4 mr-2" />
            Programmé pour le {format(new Date(tweet.scheduledFor), "dd MMMM yyyy à HH:mm", { locale: fr })}
          </div>

          {tweet.status === "PUBLISHED" && tweet.metrics && (
            <div className="flex space-x-4 text-sm text-zinc-300">
              <span>
                <strong>{tweet.metrics.impressions}</strong> impressions
              </span>
              <span>
                <strong>{tweet.metrics.engagements}</strong> engagements
              </span>
            </div>
          )}

          {tweet.status === "FAILED" && tweet.errorMessage && (
            <div className="flex items-center text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {tweet.errorMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetCard;
