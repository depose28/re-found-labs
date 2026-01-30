import { useEffect, useState } from "react";
import { endpoints } from "@/config/api";
import PulseDot from "@/components/ui/PulseDot";

const SocialProofSection = () => {
  const [auditCount, setAuditCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAuditCount = async () => {
      try {
        const response = await fetch(endpoints.stats);
        if (response.ok) {
          const data = await response.json();
          if (data.totalAnalyses) {
            setAuditCount(data.totalAnalyses);
          }
        }
      } catch (err) {
        console.error("Failed to fetch audit count:", err);
      }
    };

    fetchAuditCount();
  }, []);

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Section Label */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <PulseDot size="md" />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Trusted By
            </span>
          </div>

          {/* Counter */}
          <div className="mb-8">
            {auditCount !== null ? (
              <p className="text-lg text-muted-foreground">
                Join{" "}
                <span className="text-3xl md:text-4xl font-display text-foreground">
                  {auditCount.toLocaleString()}+
                </span>{" "}
                stores that have run Agent Pulse audits
              </p>
            ) : (
              <p className="text-lg text-muted-foreground">
                Join the growing number of stores preparing for AI commerce
              </p>
            )}
          </div>

          {/* Placeholder for future logos */}
          <div className="border border-dashed border-border rounded-lg p-8 bg-secondary/20">
            <p className="text-sm text-muted-foreground">
              Client logos coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
