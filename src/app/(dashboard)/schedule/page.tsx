"use client"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, CalendarIcon } from "lucide-react"
import "@/app/globals.css" // Assurez-vous que le CSS du calendrier est importé

interface ScheduledTweet {
  id: string
  content: string
  scheduledFor: string
  status: "pending" | "published" | "failed"
}

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("12:00")
  const [content, setContent] = useState("")
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([])

  useEffect(() => {
    fetchScheduledTweets()
  }, [])

  const fetchScheduledTweets = async () => {
    try {
      const response = await fetch("/api/scheduled-tweets")
      if (response.ok) {
        const data = await response.json()
        setScheduledTweets(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tweets programmés:", error)
    }
  }

  const handleSchedule = async () => {
    if (!date || !content) return

    const scheduledDateTime = new Date(date)
    const [hours, minutes] = time.split(":").map(Number)
    scheduledDateTime.setHours(hours, minutes)

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
      })

      if (response.ok) {
        setContent("")
        setDate(new Date())
        setTime("12:00")
        fetchScheduledTweets()
        alert("Tweet programmé avec succès!")
      }
    } catch (error) {
      console.error("Erreur lors de la programmation:", error)
      alert("Erreur lors de la programmation du tweet")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      default:
        return "text-[#6C5CE7]"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
          Planifier un Tweet
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#6C5CE7]">Date et Heure</CardTitle>
                <CardDescription>Choisissez quand votre tweet sera publié</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} locale={fr} className="mb-4" />
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#6C5CE7]" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#6C5CE7]">Contenu du Tweet</CardTitle>
                <CardDescription>Écrivez votre tweet (280 caractères max)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Que voulez-vous tweeter ?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] mb-4 border-2 focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] outline-none"
                  maxLength={280}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">{280 - content.length} caractères restants</span>
                  <Button onClick={handleSchedule} className="bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white">
                    Programmer pour {date ? format(date, "d MMMM yyyy", { locale: fr }) : "..."} à {time}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#6C5CE7]">Tweets Programmés</CardTitle>
              <CardDescription>Liste de vos tweets en attente de publication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledTweets.length === 0 ? (
                  <p className="text-center text-zinc-500 py-4">Aucun tweet programmé</p>
                ) : (
                  scheduledTweets
                    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                    .map((tweet) => (
                      <div
                        key={tweet.id}
                        className="border border-gray-100 hover:border-[#6C5CE7]/30 transition-colors duration-200 rounded-lg p-4 space-y-2"
                      >
                        <p className="font-medium">{tweet.content}</p>
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-[#6C5CE7]" />
                            <span>
                              {format(new Date(tweet.scheduledFor), "d MMMM yyyy 'à' HH:mm", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <span className={`font-medium ${getStatusColor(tweet.status)}`}>
                            {tweet.status === "pending" && "En attente"}
                            {tweet.status === "published" && "Publié"}
                            {tweet.status === "failed" && "Échec"}
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
    </div>
  )
}

