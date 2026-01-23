import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (!isHomePage) {
      e.preventDefault();
      navigate("/" + anchor);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Back button */}
          <div className="flex items-center gap-4">
            {!isHomePage && (
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <PulseDot size="md" />
              <span className="font-display text-xl text-foreground">
                Agent Pulse
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              How It Works
            </a>
            <a
              href="#what-we-check"
              onClick={(e) => handleAnchorClick(e, "#what-we-check")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            >
              What We Check
            </a>
            {!isHomePage && (
              <Link
                to="/"
                className="text-sm font-medium px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                New Analysis
              </Link>
            )}
          </nav>

          {/* Mobile: New Analysis button when not on home */}
          <div className="md:hidden">
            {!isHomePage && (
              <Link
                to="/"
                className="text-sm font-medium px-3 py-1.5 border border-foreground text-foreground"
              >
                New Analysis
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
