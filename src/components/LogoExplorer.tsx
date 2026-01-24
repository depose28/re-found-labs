import React from "react";

const LogoExplorer = () => {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <h1 className="text-2xl font-medium text-foreground mb-8">Logo Variations</h1>
      
      <div className="grid gap-12">
        {/* Variation 1 - Classic Script */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 1 — Instrument Serif italic for "Re:"</p>
          <div className="text-4xl md:text-5xl tracking-tight">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-normal text-muted-foreground ml-1">Labs</span>
          </div>
        </div>

        {/* Variation 2 - Accent colored Re */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 2 — Italic "Re:" with accent color</p>
          <div className="text-4xl md:text-5xl tracking-tight">
            <span className="font-serif italic font-bold text-accent">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-normal text-muted-foreground ml-1">Labs</span>
          </div>
        </div>

        {/* Variation 3 - Lighter weight Labs */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 3 — Smaller, lighter "Labs"</p>
          <div className="text-4xl md:text-5xl tracking-tight flex items-baseline">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-light text-muted-foreground text-2xl md:text-3xl ml-2">Labs</span>
          </div>
        </div>

        {/* Variation 4 - Uppercase LABS */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 4 — Uppercase "LABS" with letter spacing</p>
          <div className="text-4xl md:text-5xl tracking-tight flex items-baseline">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-normal text-muted-foreground text-xl md:text-2xl ml-2 tracking-[0.2em] uppercase">Labs</span>
          </div>
        </div>

        {/* Variation 5 - Stacked */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 5 — Stacked layout</p>
          <div className="flex flex-col">
            <div className="text-4xl md:text-5xl tracking-tight">
              <span className="font-serif italic font-bold">Re:</span>
              <span className="font-sans font-bold">found</span>
            </div>
            <span className="font-sans font-normal text-muted-foreground text-lg tracking-[0.3em] uppercase mt-1">Labs</span>
          </div>
        </div>

        {/* Variation 6 - Monospace Labs */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 6 — Monospace "Labs"</p>
          <div className="text-4xl md:text-5xl tracking-tight flex items-baseline">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-mono font-normal text-muted-foreground text-xl md:text-2xl ml-2">Labs</span>
          </div>
        </div>

        {/* Variation 7 - Dark background version */}
        <div className="p-8 bg-foreground rounded-lg">
          <p className="text-sm text-muted mb-4">Variation 7 — On dark background</p>
          <div className="text-4xl md:text-5xl tracking-tight text-background">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-normal opacity-60 ml-1">Labs</span>
          </div>
        </div>

        {/* Variation 8 - Pill accent */}
        <div className="p-8 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-4">Variation 8 — "Labs" in pill badge</p>
          <div className="text-4xl md:text-5xl tracking-tight flex items-center">
            <span className="font-serif italic font-bold">Re:</span>
            <span className="font-sans font-bold">found</span>
            <span className="font-sans font-medium text-sm bg-accent text-accent-foreground px-2 py-1 rounded-full ml-3">Labs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoExplorer;
