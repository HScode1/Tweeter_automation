"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, Check, Loader2 } from "lucide-react";

const ImportationPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<"idle" | "downloading" | "extracting" | "transcribing" | "generating" | "done">("idle");
  const [results, setResults] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [summaryImage, setSummaryImage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentType, setContentType] = useState<"tweets" | "threads" | "carrousel">("carrousel");
  const [outputLanguage, setOutputLanguage] = useState<string>("fr");
  
  // New state for tweet composition
  const [tweetContent, setTweetContent] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string>("");
  const MAX_TWEET_LENGTH = 280;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    setError("");
    if (!videoUrl && !file) {
      setError("Veuillez fournir une URL ou déposer un fichier vidéo.");
      return;
    }
    setIsLoading(true);
    setResults([]);
    setThumbnail("");
    setSummaryImage("");
    setProgress(0);
    setCurrentStep("downloading");
    try {
      const endpoint = contentType === "carrousel" ? "/api/carrousel" : "/api/import";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, contentType, outputLanguage }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur");
      }
      setProgress(30);
      setCurrentStep("extracting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(50);
      setCurrentStep("transcribing");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(70);
      setCurrentStep("generating");
      const data = await response.json();
      setCurrentStep("done");
      setProgress(100);
      if (contentType === "carrousel") {
        setResults(data.results || []);
        setThumbnail(data.thumbnail || "");
        setSummaryImage(data.summaryImage || "");
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erreur lors du traitement");
      } else {
        setError("Une erreur inconnue est survenue");
      }
      setCurrentStep("idle");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  // New function to handle tweet publication
  const handlePublishTweet = async () => {
    if (!tweetContent.trim()) {
      setPublishError("Le contenu du tweet ne peut pas être vide");
      return;
    }

    if (tweetContent.length > MAX_TWEET_LENGTH) {
      setPublishError(`Le tweet ne peut pas dépasser ${MAX_TWEET_LENGTH} caractères`);
      return;
    }

    setIsPublishing(true);
    setPublishError("");

    try {
      const response = await fetch("/api/post-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: tweetContent,
          mediaUrls: selectedImages
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la publication");
      }

      const data = await response.json();
      
      // Clear form after successful publication
      setTweetContent("");
      setSelectedImages([]);
      
      toast.success("Tweet publié avec succès", {
        description: "Votre tweet a été publié sur Twitter"
      });
    } catch (err) {
      if (err instanceof Error) {
        setPublishError(err.message || "Erreur lors de la publication");
      } else {
        setPublishError("Une erreur inconnue est survenue");
      }
      
      toast.error("Échec de la publication du tweet", {
        description: publishError
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Function to toggle image selection for tweet
  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(url => url !== imageUrl));
    } else {
      // Twitter allows max 4 images per tweet
      if (selectedImages.length < 4) {
        setSelectedImages([...selectedImages, imageUrl]);
      } else {
        toast.warning("Limite atteinte", {
          description: "Vous ne pouvez pas sélectionner plus de 4 images"
        });
      }
    }
  };

  const languages = [
    { value: "fr", label: "Français" },
    { value: "en", label: "Anglais" },
    { value: "es", label: "Espagnol" },
    { value: "de", label: "Allemand" },
    { value: "it", label: "Italien" },
    { value: "pt", label: "Portugais" }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900">
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
                  Studio
                </h1>
                <p className="text-zinc-200 text-lg mt-1">
                  Transformez vos vidéos en contenu engageant
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["carrousel", "tweets", "threads"].map((type) => (
                  <Button
                    key={type}
                    variant={contentType === type ? "default" : "outline"}
                    onClick={() => setContentType(type as typeof contentType)}
                    className={`w-32 rounded-full transition-all duration-300 ${
                      contentType === type 
                        ? "bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white" 
                        : "border-[#6C5CE7]/50 text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Video Source Card */}
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent border-b border-zinc-700/50">
                  <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Source de la vidéo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-200">URL de la vidéo</Label>
                    <Input
                      placeholder="Collez l'URL de votre vidéo ici"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={isLoading || !!file}
                      className="border-2 border-zinc-600 focus-visible:ring-[#6C5CE7] focus-visible:border-[#6C5CE7] rounded-lg bg-zinc-700/70 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-200">Ou déposez un fichier</Label>
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                        ${isLoading ? "bg-zinc-700/50 cursor-not-allowed" : "hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/5 cursor-pointer"}
                        ${file ? "border-[#6C5CE7] bg-[#6C5CE7]/10" : "border-zinc-600"}
                      `}
                    >
                      {file ? (
                        <div className="text-[#6C5CE7]">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm mt-1">Fichier prêt à être importé</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            className="mt-2 text-[#6C5CE7] hover:text-[#6C5CE7]/90 hover:bg-[#6C5CE7]/20"
                            disabled={isLoading}
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <div className="text-zinc-300">
                          <p className="font-medium">Glissez-déposez ici</p>
                          <p className="text-sm mt-1">ou cliquez pour sélectionner</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-200">Langue de sortie</Label>
                    <Select 
                      value={outputLanguage} 
                      onValueChange={setOutputLanguage}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-2 border-zinc-600 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] rounded-lg bg-zinc-700/70 text-white">
                        <SelectValue placeholder="Sélectionnez une langue" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value} className="focus:bg-[#6C5CE7]/20 focus:text-white">
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={isLoading || (!videoUrl && !file)}
                    className="w-full bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-lg py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20"
                  >
                    {isLoading ? "Importation en cours..." : "Lancer l'importation"}
                  </Button>
                  {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent border-b border-zinc-700/50">
                  <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Progression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="h-3 bg-zinc-700/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {["downloading", "extracting", "transcribing", "generating"].map((step) => (
                      <div
                        key={step}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          currentStep === step
                            ? "bg-[#6C5CE7]/10 border-[#6C5CE7] shadow-md"
                            : currentStep === "done" && progress === 100
                              ? "bg-green-900/20 border-green-500"
                              : "bg-zinc-700/50 border-zinc-600"
                        }`}
                      >
                        <p className="font-medium text-zinc-200 capitalize">
                          {
                            {
                              downloading: "Téléchargement",
                              extracting: "Extraction",
                              transcribing: "Transcription",
                              generating: "Génération",
                            }[step]
                          }
                        </p>
                        <p className="text-sm text-zinc-300">
                          {currentStep === step
                            ? "En cours..."
                            : currentStep === "done" && progress === 100
                              ? "Terminé"
                              : "En attente"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            {results.length > 0 && (
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent border-b border-zinc-700/50">
                  <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Résultats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {contentType === "carrousel" && thumbnail && summaryImage && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        { label: "Miniature", url: thumbnail, fileName: "thumbnail.jpg" },
                        { label: "Image de résumé", url: summaryImage, fileName: "summary.png" }
                      ].map((item, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden border border-zinc-600 hover:border-[#6C5CE7]/50 transition-all duration-200 group">
                          <div className="aspect-video relative">
                            <Image
                              src={item.url}
                              alt={item.label}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                            <span className="text-white font-medium">{item.label}</span>
                            <Button
                              onClick={() => handleDownloadImage(item.url, item.fileName)}
                              size="sm"
                              className="absolute bottom-3 right-3 bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-full px-4 py-1 text-sm transition-all duration-300 hover:shadow-lg"
                            >
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-200">Contenu généré</Label>
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <Card
                          key={index}
                          className="border border-zinc-600 hover:border-[#6C5CE7]/50 bg-zinc-700/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
                        >
                          <CardContent className="p-4">
                            <p className="whitespace-pre-wrap text-zinc-200">{result}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tweet Publication Section */}
            {results.length > 0 && (
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent border-b border-zinc-700/50">
                  <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Publier un Tweet</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-zinc-200">Contenu du tweet</Label>
                      <span className={`text-xs ${tweetContent.length > MAX_TWEET_LENGTH ? 'text-red-400' : 'text-zinc-400'}`}>
                        {tweetContent.length}/{MAX_TWEET_LENGTH}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Composez votre tweet ici..."
                      value={tweetContent}
                      onChange={(e) => setTweetContent(e.target.value)}
                      className="border-2 border-zinc-600 focus-visible:ring-[#6C5CE7] focus-visible:border-[#6C5CE7] rounded-lg bg-zinc-700/70 text-white min-h-[120px]"
                      disabled={isPublishing}
                    />
                  </div>
                  
                  {/* Image Selection for Tweet */}
                  {contentType === "carrousel" && thumbnail && summaryImage && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-zinc-200">Sélectionner des images (max 4)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[thumbnail, summaryImage].map((imageUrl, index) => (
                          <div 
                            key={index}
                            onClick={() => toggleImageSelection(imageUrl)}
                            className={`
                              relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer
                              ${selectedImages.includes(imageUrl) 
                                ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/50' 
                                : 'border-zinc-600 hover:border-[#6C5CE7]/50'}
                            `}
                          >
                            <div className="aspect-video relative">
                              <Image
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              {selectedImages.includes(imageUrl) && (
                                <div className="absolute top-2 right-2 bg-[#6C5CE7] rounded-full p-1">
                                  <Check size={16} className="text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {publishError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      <span>{publishError}</span>
                    </div>
                  )}
                  
                  <Button
                    onClick={handlePublishTweet}
                    disabled={isPublishing || tweetContent.length > MAX_TWEET_LENGTH}
                    className="w-full bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:from-[#5D4ED6] hover:to-[#7D6DE7] text-white rounded-lg py-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/20"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Publication en cours...
                      </>
                    ) : (
                      "Publier le tweet"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ImportationPage;