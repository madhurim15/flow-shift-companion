import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
