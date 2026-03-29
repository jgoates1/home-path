import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label="Back to top"
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Back to top</TooltipContent>
    </Tooltip>
  );
}
