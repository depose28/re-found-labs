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
  discovery: { icon: Search, label: "Discovery" },
  performance: { icon: Zap, label: "Performance" },
  transaction: { icon: CreditCard, label: "Transaction" },
  trust: { icon: Shield, label: "Trust" },
};

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Passed" },
  partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Partial" },
  fail: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
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
    const passCount = categoryChecks.filter(c => c.status === "pass").length;
    const failCount = categoryChecks.filter(c => c.status === "fail").length;
    return { category, score, max, checks: categoryChecks, passCount, failCount };
  });

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Detailed Results</p>
        <h2 className="font-display text-2xl text-foreground">
          Individual Checks
        </h2>
      </div>

      <Accordion type="multiple" className="border border-border divide-y divide-border">
        {categoryScores.map(({ category, score, max, checks: categoryChecks, passCount, failCount }) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <AccordionItem
              key={category}
              value={category}
              className="border-0"
            >
              <AccordionTrigger className="hover:no-underline hover:bg-secondary/30 px-5 py-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 border border-border">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">
                      {config.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {passCount} passed · {failCount} failed
                    </p>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground mr-2">
                    {score}/{max}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="space-y-3 mt-2 ml-14">
                  {categoryChecks.map((check) => {
                    const status = statusConfig[check.status];
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={check.id}
                        className="flex items-start gap-4 p-4 bg-secondary/30 border border-border"
                      >
                        <div className={`w-8 h-8 flex items-center justify-center ${status.bg} flex-shrink-0`}>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {check.name}
                            </span>
                            <span className="text-sm font-mono text-muted-foreground">
                              {check.score}/{check.maxScore}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {check.details}
                          </p>
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
