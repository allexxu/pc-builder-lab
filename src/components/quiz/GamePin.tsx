import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GamePinProps {
  pin: string;
  size?: "small" | "large";
}

const GamePin = ({ pin, size = "large" }: GamePinProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLarge = size === "large";

  return (
    <div className="flex flex-col items-center gap-2">
      <p className={`text-muted-foreground ${isLarge ? "text-lg" : "text-sm"}`}>
        Cod de acces:
      </p>
      <div className="flex items-center gap-3">
        <div
          className={`font-mono font-bold tracking-[0.3em] bg-primary/10 border-2 border-primary rounded-lg px-6 py-3 ${
            isLarge ? "text-4xl md:text-6xl" : "text-2xl"
          }`}
        >
          {pin}
        </div>
        <Button
          variant="outline"
          size={isLarge ? "lg" : "default"}
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiat
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiază
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GamePin;
