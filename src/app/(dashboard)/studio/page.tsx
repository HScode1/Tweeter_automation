"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";

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
        body: JSON.stringify({ videoUrl, contentType }),
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
              <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-zinc-700/90 to-zinc-800/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent border-b border-zinc-700/50">
                  <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Résultats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {contentType === "carrousel" && thumbnail && summaryImage && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        { label: "Miniature", src: thumbnail, filename: "thumbnail.jpg" },
                        { label: "Image de résumé", src: summaryImage, filename: "summary.jpg" },
                      ].map(({ label, src, filename }) => (
                        <div key={label} className="space-y-2">
                          <Label className="text-sm font-medium text-zinc-200">{label}</Label>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-700/70 shadow-md">
                            <Image src={src || "/placeholder.svg"} alt={label} fill className="object-cover" />
                            <Button
                              onClick={() => handleDownloadImage(src, filename)}
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
          </div>
        </main>
      </div>
    </>
  );
};

export default ImportationPage;