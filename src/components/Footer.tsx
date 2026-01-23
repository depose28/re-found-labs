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
                Agent Pulse
              </span>
            </div>
            <span className="text-sm text-muted-foreground font-mono">
              Built in Berlin
            </span>
          </div>

          {/* Contact */}
          <div className="text-sm text-muted-foreground font-mono">
            hello@agentpulse.com
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            © 2025 Agent Pulse. This tool is free and does not store your data
            beyond analysis results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
