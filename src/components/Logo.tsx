interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizes = {
    sm: {
      main: "text-lg",
      labs: "text-[8px] tracking-[0.25em]",
    },
    md: {
      main: "text-2xl",
      labs: "text-[10px] tracking-[0.3em]",
    },
    lg: {
      main: "text-4xl",
      labs: "text-xs tracking-[0.35em]",
    },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-start leading-none ${className}`}>
      <div className={`${s.main} text-foreground`}>
        <span className="font-serif italic">re:</span>
        <span className="font-sans font-normal">found</span>
      </div>
      <span className={`${s.labs} font-sans font-light text-muted-foreground uppercase mt-0.5`}>
        Labs
      </span>
    </div>
  );
};

export default Logo;
