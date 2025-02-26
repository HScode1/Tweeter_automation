"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, CheckCircle, XCircle, Calendar, Twitter, AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Media {
  id: string
  url: string
  type: "IMAGE" | "VIDEO" | "GIF"
}

interface TweetMetrics {
  impressions: number
  engagements: number
}

interface Tweet {
  id: string
  content: string
  scheduledFor: string
  status: "PENDING" | "PUBLISHED" | "FAILED" | "SCHEDULED"
  createdAt: string
  tweetId?: string
  errorMessage?: string
  retryCount: number
  media?: Media[]
  metrics?: TweetMetrics
}

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/scheduled-tweets")
      if (response.ok) {
        const data = await response.json()
        setTweets(data)
      } else {
        console.error("Erreur lors du chargement des tweets:", await response.text())
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tweets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Tweet["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Publié</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Échoué</Badge>
      case "PENDING":
      case "SCHEDULED":
        return <Badge className="bg-[#6C5CE7]/10 text-[#6C5CE7]"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
              Vos Tweets
            </h1>
            <p className="text-zinc-500">Gérez vos tweets publiés et programmés</p>
          </div>
          <Button
            asChild
            className="bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white"
          >
            <Link href="/schedule">Programmer un nouveau tweet</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {tweets.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-zinc-500">Aucun tweet pour le moment</p>
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
                <Card key={tweet.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(tweet.status)}
                        <span className="text-sm text-zinc-500">
                          {format(new Date(tweet.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      </div>
                      {tweet.status === "PUBLISHED" && tweet.tweetId && (
                        <a 
                          href={`https://twitter.com/i/web/status/${tweet.tweetId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6C5CE7] hover:text-[#8E7CF8] flex items-center text-sm"
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
                      <p className="text-zinc-800 whitespace-pre-wrap">{tweet.content}</p>
                      
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
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex items-center text-sm text-zinc-500 mb-2 sm:mb-0">
                        <Calendar className="w-4 h-4 mr-2" />
                        Programmé pour le {format(new Date(tweet.scheduledFor), "dd MMMM yyyy à HH:mm", { locale: fr })}
                      </div>
                      
                      {tweet.status === "PUBLISHED" && tweet.metrics && (
                        <div className="flex space-x-4 text-sm">
                          <span className="text-zinc-600">
                            <strong>{tweet.metrics.impressions}</strong> impressions
                          </span>
                          <span className="text-zinc-600">
                            <strong>{tweet.metrics.engagements}</strong> engagements
                          </span>
                        </div>
                      )}
                      
                      {tweet.status === "FAILED" && tweet.errorMessage && (
                        <div className="flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {tweet.errorMessage}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  )
}