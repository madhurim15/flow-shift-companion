import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, Check } from "lucide-react";

const Hydration = () => {
  const navigate = useNavigate();
  const [sips, setSips] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.title = "Hydration Break - FlowLight";
  }, []);

  useEffect(() => {
    if (sips >= 3) {
      setIsComplete(true);
    }
  }, [sips]);

  const addSip = () => {
    if (sips < 3) {
      setSips(sips + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-8 text-center">
          <div>
            <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Droplets className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Hydration Break</h1>
            <p className="text-muted-foreground">Take 3 sips of water</p>
          </div>

          {!isComplete ? (
            <div className="space-y-6">
              <div className="flex justify-center gap-4">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                      sips >= num
                        ? "border-primary bg-primary/20"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {sips >= num ? (
                      <Check className="h-8 w-8 text-primary" />
                    ) : (
                      <Droplets className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-4xl font-bold text-foreground">
                {sips} / 3 sips
              </div>

              <Button onClick={addSip} size="lg" disabled={sips >= 3}>
                <Droplets className="mr-2 h-5 w-5" />
                Take a Sip
              </Button>

              {sips > 0 && sips < 3 && (
                <p className="text-muted-foreground animate-pulse">
                  Keep going! 💧
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Check className="h-16 w-16 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Hydrated! 💧</h2>
                <p className="text-muted-foreground">Your body thanks you</p>
              </div>
              <Button onClick={() => navigate("/")} size="lg">
                Continue with your day
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hydration;
