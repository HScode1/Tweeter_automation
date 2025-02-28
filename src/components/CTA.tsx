import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/flickering-grid";
import Image from "next/image";

export function CTA() {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black min-h-[800px] overflow-hidden">
      {/* Flickering Grids en arrière-plan */}
      <div>
        <div className="absolute inset-0 w-full h-full">
          <FlickeringGrid
            className="absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_30%_50%,white,transparent)]"
            squareSize={4}
            gridGap={6}
            color="#a2d45e"
            maxOpacity={0.3}
            flickerChance={0.1}
            height={1200}
            width={1200}
          />
          {/* Deuxième FlickeringGrid à droite */}
          <div className="ml-[900px]">
            <FlickeringGrid
              className="absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_30%_50%,white,transparent)]"
              squareSize={4}
              gridGap={6}
              color="#9333ea"
              maxOpacity={0.3}
              flickerChance={0.1}
              height={1200}
              width={1200}
            />
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-[1200px] py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
            <div className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6" />
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight leading-tight">
              Prêt à Automatiser Vos Tweets?
            </h2>
            <p className="text-gray-300 mb-8">
              Commencez votre essai gratuit dès aujourd'hui.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/demo"
                className={buttonVariants({
                  variant: "outline",
                  className: "border-purple-500/50 text-white hover:bg-purple-900/20 hover:border-purple-400",
                })}
              >
                Voir une Démo
              </Link>
              <Link
                href="/try-free"
                className={buttonVariants({
                  variant: "default",
                  className: "bg-gradient-to-r from-[#a2d45e] to-purple-500 hover:from-[#b2e46e] hover:to-purple-400 text-white",
                })}
              >
                Essai Gratuit
              </Link>
            </div>
            
            {/* Image centrée */}
            <div className="relative w-full max-w-4xl mt-16">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#a2d45e]/10 to-purple-500/10 blur-xl transform -translate-y-4" />
              <Image
                src="/saas_capture.webp"
                alt="Aperçu du Dashboard"
                width={1920}
                height={1080}
                loading="lazy"
                className="w-full h-auto rounded-2xl shadow-[0_8px_30px_rgba(163,0,255,0.2)] border border-purple-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}