import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, XCircle, Search, Zap, CreditCard, Shield } from "lucide-react";

interface Check {
  id: string;
  name: string;
  category: string;
  status: "pass" | "partial" | "fail";
  score: number;
  maxScore: number;
  details: string;
  data?: any;
}

interface ChecksAccordionProps {
  checks: Check[];
}

const categoryConfig = {
  discovery: { icon: Search, label: "Discovery", number: "01" },
  performance: { icon: Zap, label: "Performance", number: "02" },
  transaction: { icon: CreditCard, label: "Transaction", number: "03" },
  trust: { icon: Shield, label: "Trust", number: "04" },
};

const statusIcons = {
  pass: { icon: CheckCircle2, color: "text-success" },
  partial: { icon: AlertTriangle, color: "text-warning" },
  fail: { icon: XCircle, color: "text-destructive" },
};

const ChecksAccordion = ({ checks }: ChecksAccordionProps) => {
  // Group checks by category
  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, Check[]>);

  // Calculate category scores
  const categoryScores = Object.entries(groupedChecks).map(([category, categoryChecks]) => {
    const score = categoryChecks.reduce((sum, check) => sum + check.score, 0);
    const max = categoryChecks.reduce((sum, check) => sum + check.maxScore, 0);
    return { category, score, max, checks: categoryChecks };
  });

  return (
    <section className="bg-card border border-border p-6 md:p-8">
      <h2 className="font-display text-2xl text-foreground mb-8">
        Detailed Analysis
      </h2>

      <Accordion type="single" collapsible className="space-y-0 border-t border-border">
        {categoryScores.map(({ category, score, max, checks: categoryChecks }) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;

          return (
            <AccordionItem
              key={category}
              value={category}
              className="border-b border-border"
            >
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 w-full">
                  <span className="text-accent font-mono text-xs">
                    {config.number}
                  </span>
                  <config.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  <span className="font-mono text-sm uppercase tracking-wide text-foreground flex-1 text-left">
                    {config.label}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground mr-2">
                    {score}/{max}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 mt-2">
                  {categoryChecks.map((check) => {
                    const StatusIcon = statusIcons[check.status].icon;
                    const statusColor = statusIcons[check.status].color;

                    return (
                      <div
                        key={check.id}
                        className="p-4 bg-secondary/50 border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`h-5 w-5 ${statusColor} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-sm text-foreground">
                                {check.name}
                              </span>
                              <span className="text-sm font-mono text-muted-foreground">
                                {check.score}/{check.maxScore}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {check.details}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
};

export default ChecksAccordion;
