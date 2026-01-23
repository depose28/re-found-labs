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
  discovery: { icon: Search, label: "Discovery", color: "accent" },
  performance: { icon: Zap, label: "Performance", color: "warning" },
  transaction: { icon: CreditCard, label: "Transaction", color: "success" },
  trust: { icon: Shield, label: "Trust", color: "primary" },
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
    <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Detailed Analysis
      </h2>

      <Accordion type="single" collapsible className="space-y-3">
        {categoryScores.map(({ category, score, max, checks: categoryChecks }) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;

          return (
            <AccordionItem
              key={category}
              value={category}
              className="border rounded-xl px-4 data-[state=open]:bg-secondary/30"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                      config.color === "accent"
                        ? "bg-accent/10 text-accent"
                        : config.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : config.color === "success"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <config.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-foreground flex-1 text-left">
                    {config.label}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground mr-2">
                    {score}/{max}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 mt-2">
                  {categoryChecks.map((check) => {
                    const StatusIcon = statusIcons[check.status].icon;
                    const statusColor = statusIcons[check.status].color;

                    return (
                      <div
                        key={check.id}
                        className="p-4 rounded-lg bg-background border"
                      >
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`h-5 w-5 ${statusColor} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-foreground">
                                {check.name}
                              </span>
                              <span className="text-sm font-semibold text-muted-foreground">
                                {check.score}/{check.maxScore}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
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
