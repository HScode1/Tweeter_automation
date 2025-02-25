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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
              Studio
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mt-1">
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
          <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent">
              <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Source de la vidéo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">URL de la vidéo</Label>
                <Input
                  placeholder="Collez l'URL de votre vidéo ici"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isLoading || !!file}
                  className="border-2 border-gray-200 dark:border-gray-700 focus-visible:ring-[#6C5CE7] focus-visible:border-[#6C5CE7] rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ou déposez un fichier</Label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                    ${isLoading ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/5 cursor-pointer"}
                    ${file ? "border-[#6C5CE7] bg-[#6C5CE7]/10" : "border-gray-200 dark:border-gray-600"}
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
                    <div className="text-zinc-500 dark:text-zinc-400">
                      <p className="font-medium">Glissez-déposez ici</p>
                      <p className="text-sm mt-1">ou cliquez pour sélectionner</p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleImport}
                disabled={isLoading || (!videoUrl && !file)}
                className="w-full bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white rounded-lg py-2 transition-all duration-300 hover:scale-105"
              >
                {isLoading ? "Importation en cours..." : "Lancer l'importation"}
              </Button>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent">
              <CardTitle className="text-[#6C5CE7] text-xl font-semibold">Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C5CE7] transition-all duration-500 ease-out"
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
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 capitalize">
                      {
                        {
                          downloading: "Téléchargement",
                          extracting: "Extraction",
                          transcribing: "Transcription",
                          generating: "Génération",
                        }[step]
                      }
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
          <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-[#6C5CE7]/10 to-transparent">
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
                      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</Label>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md">
                        <Image src={src || "/placeholder.svg"} alt={label} fill className="object-cover" />
                        <Button
                          onClick={() => handleDownloadImage(src, filename)}
                          className="absolute bottom-3 right-3 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white rounded-full px-4 py-1 text-sm transition-all duration-300 hover:scale-105"
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Contenu généré</Label>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card
                      key={index}
                      className="border border-gray-100 dark:border-gray-700 hover:border-[#6C5CE7]/50 bg-white dark:bg-gray-800 transition-all duration-200 rounded-lg"
                    >
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{result}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImportationPage;