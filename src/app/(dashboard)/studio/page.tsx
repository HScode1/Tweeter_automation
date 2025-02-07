"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

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
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement");
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Studio</h1>
            <p className="text-muted-foreground">Générez du contenu à partir de vos vidéos</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={contentType === "carrousel" ? "default" : "outline"}
              onClick={() => setContentType("carrousel")}
              className="w-32"
            >
              Carrousel
            </Button>
            <Button
              variant={contentType === "tweets" ? "default" : "outline"}
              onClick={() => setContentType("tweets")}
              className="w-32"
            >
              Tweets
            </Button>
            <Button
              variant={contentType === "threads" ? "default" : "outline"}
              onClick={() => setContentType("threads")}
              className="w-32"
            >
              Threads
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Source de la vidéo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  placeholder="Collez l'URL de votre vidéo ici"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isLoading || !!file}
                />
              </div>
              <div className="space-y-2">
                <Label>Ou déposez votre fichier</Label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  className={`
                    border-2 border-dashed rounded-lg p-8
                    ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
                    ${file ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                    transition-colors duration-200 text-center
                  `}
                >
                  {file ? (
                    <div className="text-green-600">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm">Fichier prêt à être importé</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="mt-2"
                        disabled={isLoading}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <p>Glissez-déposez votre fichier ici</p>
                      <p className="text-sm">ou cliquez pour sélectionner</p>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleImport} 
                disabled={isLoading || (!videoUrl && !file)} 
                className="w-full"
              >
                {isLoading ? 'Importation en cours...' : 'Importer'}
              </Button>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-2 gap-4">
                {(['downloading', 'extracting', 'transcribing', 'generating'] as const).map((step) => (
                  <div
                    key={step}
                    className={`p-4 rounded-lg border ${
                      currentStep === step
                        ? 'bg-primary/10 border-primary'
                        : currentStep === 'done' && progress === 100
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {step === 'downloading' && 'Téléchargement'}
                      {step === 'extracting' && 'Extraction'}
                      {step === 'transcribing' && 'Transcription'}
                      {step === 'generating' && 'Génération'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentStep === step
                        ? 'En cours...'
                        : currentStep === 'done' && progress === 100
                        ? 'Terminé'
                        : 'En attente'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentType === "carrousel" && thumbnail && (
                  <div className="space-y-2">
                    <Label>Miniature</Label>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={thumbnail}
                        alt="Miniature"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        onClick={() => handleDownloadImage(thumbnail, 'thumbnail.jpg')}
                        className="absolute bottom-4 right-4"
                        variant="secondary"
                      >
                        Télécharger
                      </Button>
                    </div>
                  </div>
                )}
                
                {contentType === "carrousel" && summaryImage && (
                  <div className="space-y-2">
                    <Label>Image de résumé</Label>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={summaryImage}
                        alt="Résumé"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        onClick={() => handleDownloadImage(summaryImage, 'summary.jpg')}
                        className="absolute bottom-4 right-4"
                        variant="secondary"
                      >
                        Télécharger
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Contenu généré</Label>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <Card key={index}>
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
  );
};

export default ImportationPage;
