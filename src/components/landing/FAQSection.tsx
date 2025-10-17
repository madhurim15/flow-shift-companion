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
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about FlowLight
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-xl bg-card px-6 py-2 glass-card"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
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
