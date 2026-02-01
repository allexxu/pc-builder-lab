import { Cpu, Github, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">PC Builder</span>
                <span className="text-foreground"> Academy</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Platformă educațională interactivă pentru elevi. Învață componentele 
              calculatorului și asamblează un PC într-un joc captivant!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navigare Rapidă</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/lectii" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lecții
                </Link>
              </li>
              <li>
                <Link to="/joc" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Joacă
                </Link>
              </li>
              <li>
                <Link to="/clasament" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Clasament
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resurse</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/despre" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Despre Proiect
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <Github className="h-3 w-3" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 PC Builder Academy. Toate drepturile rezervate.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Făcut cu <Heart className="h-3 w-3 text-destructive" /> pentru elevi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
