import PulseDot from "@/components/ui/PulseDot";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Logo & Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PulseDot size="md" />
              <span className="font-display text-xl text-foreground">
                re:found Labs
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Free AI agent readiness audits for e-commerce.
              <br />
              Built in Berlin.
            </p>
          </div>

          {/* Contact */}
          <div className="text-sm text-muted-foreground">
            <a href="mailto:hello@refoundlabs.com" className="hover:text-foreground transition-colors">
              hello@refoundlabs.com
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2025 re:found Labs. Your data is analyzed in real-time and not stored beyond your session.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
