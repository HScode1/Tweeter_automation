import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/flickering-grid";

export function CTA() {
  return (
    <section className="relative bg-[#F8F7FF] min-h-[800px] overflow-hidden">
      {/* Flickering Grids en arrière-plan */}
      <div>
        <div className="absolute inset-0 w-full h-full">
          <FlickeringGrid
            className="absolute inset-0 z-0 [mask-image:radial-gradient(70%_50%_at_30%_50%,white,transparent)]"
            squareSize={4}
            gridGap={6}
            color="#60A5FA"
            maxOpacity={0.5}
            flickerChance={0.1}
            height={1200}
            width={1200}
          />
          {/* Deuxième FlickeringGrid à droite */}
        
          <div className="ml-[900px]">
            <FlickeringGrid
              className=" absoluteinset-0 z-0 [mask-image:radial-gradient(70%_50%_at_30%_50%,white,transparent)]"
              squareSize={4}
              gridGap={6}
              color="#60A5FA"
              maxOpacity={0.5}
              flickerChance={0.1}
              height={1200}
              width={1200}
            />
          </div>
          
            
        
        </div>
        <div className="container mx-auto px-4 max-w-[1200px] py-16">
          <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
            <h2 className="text-3xl font-medium text-gray-900">
              Ready to Close More Customers?
            </h2>
            <p className="text-gray-600 mb-6">
              Start your free trial today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/demo"
                className={buttonVariants({
                  variant: "outline",
                  className: "bg-white hover:bg-gray-50",
                })}
              >
                Get a Demo
              </Link>
              <Link
                href="/try-free"
                className={buttonVariants({
                  variant: "default",
                  className: "bg-[#6366F1] hover:bg-[#5558E3] text-white",
                })}
              >
                Try Admin for Free
              </Link>
            </div>

            {/* Image centrée */}
            <div className="relative w-full max-w-4xl mt-16">
              <img
                src="/saas_capture.png"
                alt="Dashboard Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}