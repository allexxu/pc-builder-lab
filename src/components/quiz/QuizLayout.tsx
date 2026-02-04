import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

interface QuizLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const QuizLayout = ({ children, showNav = true }: QuizLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link to="/quiz" className="flex items-center gap-2 font-bold text-xl">
              <Zap className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                TechQuiz
              </span>
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
