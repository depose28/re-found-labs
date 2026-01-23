const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-display text-lg font-bold text-primary">
              AgentReady
            </span>
            <span className="text-sm text-muted-foreground">
              Built in Berlin
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Contact: hello@agentready.com
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            © 2025 AgentReady. This tool is free and does not store your data
            beyond analysis results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
