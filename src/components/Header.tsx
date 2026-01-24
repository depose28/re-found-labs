import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [open, setOpen] = useState(false);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (!isHomePage) {
      e.preventDefault();
      navigate("/" + anchor);
    }
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  const navLinks = [
    { href: "#how-it-works", label: "How It Works", isAnchor: true },
    { href: "#what-we-check", label: "What We Check", isAnchor: true },
    { to: "/products", label: "Products", isAnchor: false },
    { to: "/services", label: "Services", isAnchor: false },
    { to: "/blog", label: "Blog", isAnchor: false },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
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
                Re:found Labs
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#what-we-check"
              onClick={(e) => handleAnchorClick(e, "#what-we-check")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              What We Check
            </a>
            <Link
              to="/products"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
            <Link
              to="/services"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              to="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <PulseDot size="sm" />
                    <span className="font-display text-lg text-foreground">Re:found Labs</span>
                  </div>
                </div>

                {/* Mobile menu links */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-1">
                    {navLinks.map((link) => (
                      <li key={link.label}>
                        {link.isAnchor ? (
                          <a
                            href={link.href}
                            onClick={(e) => handleAnchorClick(e, link.href!)}
                            className="flex items-center py-3 text-base text-foreground hover:text-accent transition-colors"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            to={link.to!}
                            onClick={handleLinkClick}
                            className="flex items-center py-3 text-base text-foreground hover:text-accent transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile menu footer */}
                <div className="p-6 border-t border-border">
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    className="block w-full text-center py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                  >
                    Get Your Agent Score
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
