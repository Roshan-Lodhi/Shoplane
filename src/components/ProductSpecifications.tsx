import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSpecificationsProps {
  product: Product;
}

interface Specification {
  label: string;
  value: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [specsLoaded, setSpecsLoaded] = useState(false);
  const [faqsLoaded, setFaqsLoaded] = useState(false);

  const fetchSpecifications = async () => {
    if (specsLoaded) return;
    setLoadingSpecs(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-details', {
        body: { product, type: 'specifications' }
      });

      if (error) throw error;
      setSpecifications(data.specifications || []);
      setSpecsLoaded(true);
    } catch (err) {
      console.error("Error fetching specifications:", err);
      // Fallback specifications
      setSpecifications([
        { label: "Brand", value: product.brand },
        { label: "Category", value: product.category },
        { label: "Type", value: product.isAccessory ? "Accessory" : "Clothing" },
        { label: "Gender", value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) }
      ]);
      setSpecsLoaded(true);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const fetchFAQs = async () => {
    if (faqsLoaded) return;
    setLoadingFaqs(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-details', {
        body: { product, type: 'faqs' }
      });

      if (error) throw error;
      setFaqs(data.faqs || []);
      setFaqsLoaded(true);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      // Fallback FAQs
      setFaqs([
        { question: "What is the return policy?", answer: "We offer easy 30-day returns on all products." },
        { question: "Is this product authentic?", answer: `Yes, this is a genuine ${product.brand} product.` },
        { question: "What sizes are available?", answer: "Please refer to our size guide for available sizes." }
      ]);
      setFaqsLoaded(true);
    } finally {
      setLoadingFaqs(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Specifications Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="specifications" className="border rounded-lg px-4">
          <AccordionTrigger 
            onClick={fetchSpecifications}
            className="text-lg font-semibold hover:no-underline"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Product Specifications
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {loadingSpecs ? (
              <div className="space-y-3 py-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-dashed last:border-0">
                    <span className="text-muted-foreground font-medium">{spec.label}</span>
                    <span className="text-foreground text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faqs" className="border rounded-lg px-4 mt-3">
          <AccordionTrigger 
            onClick={fetchFAQs}
            className="text-lg font-semibold hover:no-underline"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {loadingFaqs ? (
              <div className="space-y-4 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-foreground">{faq.question}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ProductSpecifications;
