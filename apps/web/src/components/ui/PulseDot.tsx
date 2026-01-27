import { cn } from "@/lib/utils";

interface PulseDotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const PulseDot = ({ className, size = "md" }: PulseDotProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn(
          "absolute inline-flex rounded-full bg-accent opacity-75 animate-ping",
          sizeClasses[size]
        )}
        style={{ animationDuration: "2s" }}
      />
      <span
        className={cn("relative inline-flex rounded-full bg-accent", sizeClasses[size])}
      />
    </span>
  );
};

export default PulseDot;
