import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

const FAQ = ({ items }: FAQProps) => {
  return (
    <div className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
      {/* Background Elements */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" /> */}
      
      {/* Decorative Blob */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-purple-600 mix-blend-overlay filter blur-3xl opacity-20" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 rounded-full bg-[#a2d45e] mix-blend-overlay filter blur-3xl opacity-20" />
      
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full mx-auto mb-6" />
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a2d45e] via-white to-purple-400 mb-6 tracking-tight leading-tight">
              Questions Fréquentes
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-[#a2d45e] rounded-full mx-auto mt-6" />
          </div>
          <p className="mt-4 text-lg text-gray-300">
            Tout ce que vous devez savoir sur notre service d&apos;automatisation de tweets
          </p>
        </div>
        
        <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-purple-500/20 hover:border-[#a2d45e]/40 transition-all duration-500">
          <Accordion type="single" collapsible className="p-3">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-gray-100/10 last:border-0 group"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-lg font-medium text-white group-hover:text-[#a2d45e] transition-colors">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-gray-300 leading-relaxed pb-2">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        {/* Bottom decorative element */}
        <div className="mt-12 flex justify-center">
          <div className="w-20 h-1 bg-gradient-to-r from-[#a2d45e] to-purple-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default FAQ;