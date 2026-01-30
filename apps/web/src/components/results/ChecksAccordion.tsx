import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, XCircle, Search, CreditCard, Shield, Bot, Globe, Clock, Store, Rss, Link, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CheckData {
  // Bot access data (D1)
  botsAllowed?: string[];
  botsBlocked?: string[];
  totalBots?: number;

  // Schema validation data
  missingFields?: string[];
  invalidFields?: string[];
  warnings?: string[];

  // Sitemap data (D2)
  sitemapUrl?: string;
  urlCount?: number;

  // TTFB data (D3)
  ttfbMs?: number;
  threshold?: string;

  // Offer / UCP data (X1)
  price?: string | number;
  currency?: string;
  availability?: string;
  issues?: string[];
  offerFound?: boolean;
  offerValid?: boolean;
  offerScore?: number;
  shippingFound?: boolean;
  shippingValid?: boolean;
  shippingScore?: number;
  hasApplicableCountry?: boolean;
  applicableCountry?: string;
  countryScore?: number;

  // Organization data (T1)
  name?: string;
  type?: string;
  hasContact?: boolean;
  source?: string;

  // Trust signals data (T2)
  isHttps?: boolean;
  httpsScore?: number;
  returnPolicyFound?: boolean;
  returnPolicyScore?: number;
  returnDays?: number;
  returnMethod?: string;

  // Payment methods data (X4)
  platform?: string;
  confidence?: string;
  paymentRails?: string[];
  paymentCount?: number;

  // Product feed data (D7)
  feeds?: { url: string; type: string; source: string; productCount?: number }[];
  feedCount?: number;
  accessibleCount?: number;
  discoverySources?: string[];
  platformHint?: string;

  // FAQ Schema data (D6)
  questionCount?: number;

  // Commerce API data (D9)
  hasCheckoutInfra?: boolean;
  hasProtocolManifest?: boolean;
  checkoutApis?: string[];
  ucpReady?: boolean;
  mcpReady?: boolean;
  protocolReadiness?: {
    discovery: {
      googleShopping: { status: string; reason: string };
      klarnaApp: { status: string; reason: string };
      answerEngines: { status: string; reason: string };
    };
    commerce: {
      ucp: { status: string; reason: string };
      acp: { status: string; reason: string };
      mcp: { status: string; reason: string };
    };
    payments: {
      rails: string[];
    };
  };
}

interface Check {
  id: string;
  name: string;
  category: string;
  status: "pass" | "partial" | "fail";
  score: number;
  maxScore: number;
  details: string;
  data?: CheckData;
}

interface ChecksAccordionProps {
  checks: Check[];
}

const categoryConfig = {
  discovery: { icon: Search, label: "Find", description: "Can agents discover you?" },
  trust: { icon: Shield, label: "Trust", description: "Will agents recommend you?" },
  transaction: { icon: CreditCard, label: "Buy", description: "Can agents buy?" },
};

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Passed" },
  partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Needs Work" },
  fail: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Missing" },
};

const formatPaymentRail = (rail: string): string => {
  const labels: Record<string, string> = {
    stripe: 'Stripe',
    shopifyCheckout: 'Shopify Checkout',
    googlePay: 'Google Pay',
    applePay: 'Apple Pay',
    klarna: 'Klarna',
    paypal: 'PayPal',
  };
  return labels[rail] || rail;
};

const CheckDataDisplay = ({ check }: { check: Check }) => {
  const data = check.data;
  if (!data) return null;

  // Bot access check - show which bots are allowed/blocked
  if (check.id === "D1" && (data.botsAllowed || data.botsBlocked)) {
    return (
      <div className="mt-3 space-y-2">
        {data.botsAllowed && data.botsAllowed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Allowed:</span>
            {data.botsAllowed.slice(0, 5).map((bot) => (
              <Badge key={bot} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                <Bot className="h-3 w-3 mr-1" />
                {bot}
              </Badge>
            ))}
            {data.botsAllowed.length > 5 && (
              <Badge variant="outline" className="text-xs">+{data.botsAllowed.length - 5} more</Badge>
            )}
          </div>
        )}
        {data.botsBlocked && data.botsBlocked.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Blocked:</span>
            {data.botsBlocked.map((bot) => (
              <Badge key={bot} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                <Bot className="h-3 w-3 mr-1" />
                {bot}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sitemap check (D2 — was D3)
  if (check.id === "D2" && data.urlCount) {
    return (
      <div className="mt-3">
        <Badge variant="outline" className="text-xs">
          <Globe className="h-3 w-3 mr-1" />
          {data.urlCount} URLs indexed
        </Badge>
      </div>
    );
  }

  // TTFB check (D3)
  if (check.id === "D3" && data.ttfbMs !== undefined) {
    const ttfbColor = (data.ttfbMs as number) < 400
      ? "bg-success/10 text-success border-success/20"
      : (data.ttfbMs as number) < 800
      ? "bg-warning/10 text-warning border-warning/20"
      : "bg-destructive/10 text-destructive border-destructive/20";
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className={`text-xs ${ttfbColor}`}>
          <Clock className="h-3 w-3 mr-1" />
          {data.ttfbMs}ms TTFB
        </Badge>
        {data.threshold && (
          <Badge variant="outline" className="text-xs">
            {data.threshold}
          </Badge>
        )}
      </div>
    );
  }

  // Product Feed check (D7 — consolidated P3+P4+P5)
  if (check.id === "D7" && data.feeds && data.feeds.length > 0) {
    return (
      <div className="mt-3 space-y-2">
        {data.feeds.slice(0, 3).map((feed, i) => (
          <div key={i} className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              <Rss className="h-3 w-3 mr-1" />
              {feed.url}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {feed.type.toUpperCase()}
            </Badge>
            {feed.productCount && (
              <Badge variant="outline" className="text-xs">
                {feed.productCount} products
              </Badge>
            )}
          </div>
        ))}
        {data.discoverySources && data.discoverySources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Discovered via:</span>
            {data.discoverySources.map((src) => (
              <Badge key={src} variant="outline" className="text-xs">
                <Link className="h-3 w-3 mr-1" />
                {src}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Commerce API check (D9 — consolidated P6+P7)
  if (check.id === "D9" && (data.protocolReadiness || data.paymentRails || data.checkoutApis)) {
    return (
      <div className="mt-3 space-y-2">
        {data.paymentRails && data.paymentRails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Payment Rails:</span>
            {data.paymentRails.map((rail) => (
              <Badge key={rail} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                {formatPaymentRail(rail)}
              </Badge>
            ))}
          </div>
        )}
        {data.checkoutApis && data.checkoutApis.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">API Patterns:</span>
            {data.checkoutApis.map((api) => (
              <Badge key={api} variant="outline" className="text-xs">
                {api}
              </Badge>
            ))}
          </div>
        )}
        {data.ucpReady !== undefined && (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={`text-xs ${data.ucpReady ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
              {data.ucpReady ? "AI Checkout" : "No AI Checkout"}
            </Badge>
            <Badge variant="outline" className={`text-xs ${data.mcpReady ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
              {data.mcpReady ? "MCP Ready" : "No MCP"}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // Payment Methods check (X4)
  if (check.id === "X4" && data.platform) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={`text-xs ${check.status === "pass" ? "bg-success/10 text-success border-success/20" : ""}`}>
            <Store className="h-3 w-3 mr-1" />
            {data.platform}
          </Badge>
          {data.confidence && (
            <Badge variant="outline" className="text-xs">
              {data.confidence} confidence
            </Badge>
          )}
        </div>
        {data.paymentRails && data.paymentRails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Payment Methods:</span>
            {data.paymentRails.map((rail) => (
              <Badge key={rail} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                {formatPaymentRail(rail)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // FAQ Schema check (D6)
  if (check.id === "D6" && data.questionCount !== undefined) {
    const color = data.questionCount >= 5
      ? "bg-success/10 text-success border-success/20"
      : data.questionCount >= 1
      ? "bg-warning/10 text-warning border-warning/20"
      : "bg-destructive/10 text-destructive border-destructive/20";
    return (
      <div className="mt-3">
        <Badge variant="outline" className={`text-xs ${color}`}>
          {data.questionCount} FAQ question{data.questionCount !== 1 ? "s" : ""} found
        </Badge>
      </div>
    );
  }

  // Schema validation checks - show missing/invalid fields
  if ((data.missingFields && data.missingFields.length > 0) || 
      (data.invalidFields && data.invalidFields.length > 0) ||
      (data.warnings && data.warnings.length > 0)) {
    return (
      <div className="mt-3 space-y-2">
        {data.missingFields && data.missingFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-destructive mr-1">Missing:</span>
            {data.missingFields.map((field) => (
              <Badge key={field} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                {field}
              </Badge>
            ))}
          </div>
        )}
        {data.invalidFields && data.invalidFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-warning mr-1">Invalid:</span>
            {data.invalidFields.map((field) => (
              <Badge key={field} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                {field}
              </Badge>
            ))}
          </div>
        )}
        {data.warnings && data.warnings.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Warnings:</span>
            {data.warnings.map((warning) => (
              <Badge key={warning} variant="outline" className="text-xs">
                {warning}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Checkout Data Completeness (X1)
  if (check.id === "X1") {
    const pricingOk = data.offerFound && data.offerValid;
    const pricingPartial = data.offerFound && !data.offerValid;
    return (
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="outline" className={`text-xs ${
          pricingOk ? "bg-success/10 text-success border-success/20" :
          pricingPartial ? "bg-warning/10 text-warning border-warning/20" :
          "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          {pricingOk ? "✓" : pricingPartial ? "⚠" : "✗"} Pricing & availability
        </Badge>
        <Badge variant="outline" className={`text-xs ${
          data.shippingFound ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          {data.shippingFound ? "✓" : "✗"} Shipping details
        </Badge>
        <Badge variant="outline" className={`text-xs ${
          data.hasApplicableCountry ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          {data.hasApplicableCountry ? "✓" : "✗"} Return policy region
        </Badge>
      </div>
    );
  }

  // Organization check (T1 — was R1)
  if (check.id === "T1" && data.name) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          {data.type}: {data.name}
        </Badge>
        {data.hasContact && (
          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
            Contact info present
          </Badge>
        )}
        {data.source && (
          <Badge variant="outline" className="text-xs">
            Found on {data.source}
          </Badge>
        )}
      </div>
    );
  }

  // Trust Signals check (T2 — merged HTTPS + Return Policy)
  if (check.id === "T2") {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={`text-xs ${data.isHttps ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
            {data.isHttps ? "HTTPS enabled" : "No HTTPS"} ({data.httpsScore ?? 0}/3)
          </Badge>
          <Badge variant="outline" className={`text-xs ${data.returnPolicyFound ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
            {data.returnPolicyFound ? "Return policy" : "No return policy"} ({data.returnPolicyScore ?? 0}/4)
          </Badge>
        </div>
        {data.returnDays && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {data.returnDays} day returns
            </Badge>
            {data.returnMethod && (
              <Badge variant="outline" className="text-xs">
                {(data.returnMethod as string).replace("https://schema.org/", "")}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const ChecksAccordion = ({ checks }: ChecksAccordionProps) => {
  const [showChecks, setShowChecks] = useState(false);

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
    const partialCount = categoryChecks.filter(c => c.status === "partial").length;
    const failCount = categoryChecks.filter(c => c.status === "fail").length;
    return { category, score, max, checks: categoryChecks, passCount, partialCount, failCount };
  });

  // Sort categories in order: discovery, trust, transaction
  const categoryOrder = ["discovery", "trust", "transaction"];
  categoryScores.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  const issueCount = checks.filter(c => c.status !== "pass").length;

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Detailed Results</p>
        <h2 className="font-display text-2xl text-foreground">
          Individual Checks
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {checks.length} checks in {categoryScores.length} areas
          {issueCount > 0 && ` · ${issueCount} need${issueCount === 1 ? "s" : ""} attention`}
        </p>
      </div>

      <button
        onClick={() => setShowChecks(!showChecks)}
        className="w-full py-3 border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-4"
      >
        {showChecks ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide detailed checks
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View detailed checks ({checks.length})
          </>
        )}
      </button>

      {showChecks && <Accordion type="multiple" defaultValue={categoryScores.filter(c => c.failCount > 0 || c.partialCount > 0).map(c => c.category)} className="border border-border divide-y divide-border">
        {categoryScores.map(({ category, score, max, checks: categoryChecks, passCount, partialCount, failCount }) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;
          const Icon = config.icon;
          const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {config.label}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {config.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passCount > 0 && (
                        <span className="text-success">{passCount} passed</span>
                      )}
                      {partialCount > 0 && (
                        <>
                          {passCount > 0 && <span className="text-muted-foreground">·</span>}
                          <span className="text-warning">{partialCount} needs work</span>
                        </>
                      )}
                      {failCount > 0 && (
                        <>
                          {(passCount > 0 || partialCount > 0) && <span className="text-muted-foreground">·</span>}
                          <span className="text-destructive">{failCount} missing</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mr-2">
                    <div className="hidden sm:block w-20 h-2 bg-secondary overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percentage >= 80 ? "bg-success" :
                          percentage >= 50 ? "bg-warning" :
                          "bg-destructive"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-muted-foreground min-w-[50px] text-right">
                      {score}/{max}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <Accordion type="multiple" defaultValue={[]} className="mt-2 ml-14 space-y-2">
                  {categoryChecks.map((check) => {
                    const status = statusConfig[check.status];
                    const StatusIcon = status.icon;

                    return (
                      <AccordionItem
                        key={check.id}
                        value={check.id}
                        className="border border-border"
                      >
                        <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-4 py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-7 h-7 flex items-center justify-center ${status.bg} flex-shrink-0`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                            </div>
                            <span className="font-medium text-foreground text-sm flex-1 text-left">
                              {check.name}
                            </span>
                            <Badge variant="outline" className={`text-xs ${status.bg} ${status.color} border-current/20 mr-2`}>
                              {status.label}
                            </Badge>
                            <span className="text-sm font-mono text-muted-foreground">
                              {check.score}/{check.maxScore}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="ml-10">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {check.details}
                            </p>
                            <CheckDataDisplay check={check} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>}
    </section>
  );
};

export default ChecksAccordion;
