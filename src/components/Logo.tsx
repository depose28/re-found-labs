interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizes = {
    sm: {
      main: "text-lg",
      labs: "text-[10px] tracking-[0.2em]",
    },
    md: {
      main: "text-2xl",
      labs: "text-xs tracking-[0.2em]",
    },
    lg: {
      main: "text-4xl",
      labs: "text-sm tracking-[0.25em]",
    },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-baseline gap-1.5 ${className}`}>
      <div className={`${s.main} text-foreground leading-none`}>
        <span className="font-serif italic">re:</span>
        <span className="font-sans font-normal">found</span>
      </div>
      <span className={`${s.labs} font-sans font-light text-muted-foreground uppercase`}>
        Labs
      </span>
    </div>
  );
};

export default Logo;
