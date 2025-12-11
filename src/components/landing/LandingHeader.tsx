import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LandingHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-bold gradient-text">FlowFocus</span>
        </div>
        
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-[hsl(270,60%,65%)] hover:bg-[hsl(270,60%,55%)] text-white font-semibold px-6"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
};
