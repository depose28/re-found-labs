import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-primary">
              AgentReady
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#what-we-check"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              What We Check
            </a>
          </nav>

          {/* Mobile menu button placeholder */}
          <div className="md:hidden">
            {/* Can add hamburger menu later */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
