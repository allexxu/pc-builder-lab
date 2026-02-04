import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";

interface QuizLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const QuizLayout = ({ children, showNav = true }: QuizLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to="/quiz" className="flex items-center gap-2 font-bold text-xl">
              <Zap className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TechQuiz
              </span>
            </Link>
            <Link 
              to="/" 
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              PC Builder Academy
            </Link>
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default QuizLayout;
