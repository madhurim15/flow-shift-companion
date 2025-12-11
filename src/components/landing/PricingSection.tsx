import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const PricingSection = () => {
  const navigate = useNavigate();

  const features = [
    "Unlimited psychology-based nudges",
    "Full insights dashboard",
    "All mood & energy-based actions",
    "System-wide monitoring",
    "Privacy-first design"
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[hsl(250,60%,92%)] to-[hsl(270,55%,90%)]">
      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gray-900">
              Try It Risk‑Free
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium">
              Experience the full app free for 14 days
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative bg-white p-12 max-w-2xl mx-auto rounded-3xl shadow-2xl border-2 border-[hsl(270,60%,75%)]">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270,60%,95%)] to-transparent rounded-3xl opacity-50"></div>
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[hsl(270,60%,88%)] border-2 border-[hsl(270,60%,75%)] mb-6 animate-scale-pulse">
                <Sparkles className="w-5 h-5 text-[hsl(270,60%,55%)] animate-gentle-float" />
                <span className="text-base font-bold text-[hsl(270,60%,55%)]">14-Day Free Trial</span>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <div className="text-6xl font-bold mb-3">
                  <span className="text-[hsl(270,60%,55%)]">Free</span>
                </div>
                <p className="text-xl text-gray-700 font-medium">
                  Then stay tuned for subscription options
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  We're finalizing the best pricing for our users
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-5 mb-10">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-[hsl(140,50%,75%)] flex items-center justify-center flex-shrink-0 animate-check-draw group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl text-gray-800 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                size="lg"
                onClick={() => navigate('/beta')}
                className="w-full h-16 text-xl font-bold bg-[hsl(270,60%,65%)] hover:bg-[hsl(270,60%,55%)] text-white animate-glow-button transition-all duration-300 hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>

              <p className="text-base text-gray-600 mt-6 font-medium">
                No commitment • Privacy-first • Full access
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
