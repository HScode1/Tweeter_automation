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
<div className="min-h-screen bg-gradient-to-b from-[#F8F7FF] to-white p-4">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] bg-clip-text text-transparent">
              Studio
            </h1>
            <p className="text-zinc-500">Générez du contenu à partir de vos vidéos</p>
          </div>
          <div className="flex space-x-2">
            {["carrousel", "tweets", "threads"].map((type) => (
              <Button
                key={type}
                variant={contentType === type ? "default" : "outline"}
                onClick={() => setContentType(type as typeof contentType)}
                className={`w-32 ${
                  contentType === type ? "bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white" : "hover:bg-[#6C5CE7]/10"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#6C5CE7]">Source de la vidéo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  placeholder="Collez l'URL de votre vidéo ici"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isLoading || !!file}
                  className="border-2 focus-visible:ring-[#6C5CE7] focus-visible:border-[#6C5CE7]"
                />
              </div>
              <div className="space-y-2">
                <Label>Ou déposez votre fichier</Label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  className={`
                    border-2 border-dashed rounded-lg p-8
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : "hover:border-[#6C5CE7] cursor-pointer"}
                    ${file ? "border-[#6C5CE7] bg-[#6C5CE7]/5" : "border-gray-200"}
                    transition-colors duration-200 text-center
                  `}
                >
                  {file ? (
                    <div className="text-[#6C5CE7]">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm">Fichier prêt à être importé</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="mt-2 text-[#6C5CE7] hover:text-[#6C5CE7]/90 hover:bg-[#6C5CE7]/10"
                        disabled={isLoading}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-zinc-500">
                      <p>Glissez-déposez votre fichier ici</p>
                      <p className="text-sm">ou cliquez pour sélectionner</p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleImport}
                disabled={isLoading || (!videoUrl && !file)}
                className="w-full bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white"
              >
                {isLoading ? "Importation en cours..." : "Importer"}
              </Button>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#6C5CE7]">Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C5CE7] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["downloading", "extracting", "transcribing", "generating"].map((step) => (
                  <div
                    key={step}
                    className={`p-4 rounded-lg border ${
                      currentStep === step
                        ? "bg-[#6C5CE7]/10 border-[#6C5CE7]"
                        : currentStep === "done" && progress === 100
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {
                        {
                          downloading: "Téléchargement",
                          extracting: "Extraction",
                          transcribing: "Transcription",
                          generating: "Génération",
                        }[step]
                      }
                    </p>
                    <p className="text-sm text-zinc-500">
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

        {results.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#6C5CE7]">Résultats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentType === "carrousel" &&
                  thumbnail &&
                  summaryImage &&
                  [
                    { label: "Miniature", src: thumbnail, filename: "thumbnail.jpg" },
                    {
                      label: "Image de résumé",
                      src: summaryImage,
                      filename: "summary.jpg",
                    },
                  ].map(({ label, src, filename }) => (
                    <div key={label} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <Image src={src || "/placeholder.svg"} alt={label} className="object-cover w-full h-full" />
                        <Button
                          onClick={() => handleDownloadImage(src, filename)}
                          className="absolute bottom-4 right-4 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white"
                        >
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}

                <div className="space-y-2">
                  <Label>Contenu généré</Label>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <Card
                        key={index}
                        className="border border-gray-100 hover:border-[#6C5CE7]/30 transition-colors duration-200"
                      >
                        <CardContent className="p-4">
                          <p className="whitespace-pre-wrap">{result}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ImportationPage
