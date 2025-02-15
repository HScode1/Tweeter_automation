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
    <div className="relative py-16 px-4 sm:px-6 lg:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 opacity-50" />
      
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Questions Fréquentes
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tout ce que vous devez savoir sur notre service d&apos;automatisation de tweets
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
          <Accordion type="single" collapsible className="p-6">
            {items.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-gray-100 last:border-0"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
