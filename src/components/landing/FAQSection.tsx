import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Is this a blocker app?",
      answer: "No. FlowLight uses a psychology-first approach. Instead of blocking apps, we help you notice patterns and offer productive alternatives right when you're tempted to scroll."
    },
    {
      question: "Does it work across all apps?",
      answer: "Yes. FlowLight monitors system-wide activity on Android, including social media platforms, video streaming services, shopping apps, and more."
    },
    {
      question: "Will it shame me for using apps?",
      answer: "Never. We avoid judgment and focus on awareness. Our nudges are gentle, supportive, and based on psychological principles—not guilt."
    },
    {
      question: "What happens after 14 days?",
      answer: "You'll see your time saved, reduced scrolling patterns, and action streaks. If you find it valuable, continue with a subscription. Cancel anytime if it's not for you."
    },
    {
      question: "How is my data handled?",
      answer: "All your data stays private and secure on your device. We never sell your data or share it with third parties. You're in full control."
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[hsl(160,50%,92%)] to-[hsl(140,45%,90%)]">
      {/* Decorative blobs - Hidden on mobile */}
      <div className="hidden md:block absolute top-20 right-10 w-72 h-72 bg-[hsl(160,50%,75%)]/25 rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute bottom-20 left-10 w-64 h-64 bg-[hsl(140,45%,75%)]/25 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gray-900">
              Common Questions
            </h2>
            <p className="text-xl text-gray-800 font-medium">
              Everything you need to know about FlowLight
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={200}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm border-0 px-8 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <AccordionTrigger className="text-xl font-bold text-gray-900 hover:text-[hsl(270,60%,65%)] transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg leading-relaxed pt-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
