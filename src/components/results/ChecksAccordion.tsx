import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, XCircle, Search, Zap, CreditCard, Shield, Radio, Bot, Globe, Tag, Clock, Store, Rss, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CheckData {
  // Bot access data
  botsAllowed?: string[];
  botsBlocked?: string[];
  totalBots?: number;
  
  // Schema validation data
  missingFields?: string[];
  invalidFields?: string[];
  warnings?: string[];
  
  // Sitemap data
  sitemapUrl?: string;
  urlCount?: number;
  
  // PageSpeed data
  performanceScore?: number;
  lcp?: string;
  cls?: string;
  tti?: string;
  
  // Offer data
  price?: string | number;
  currency?: string;
  availability?: string;
  issues?: string[];
  
  // Organization data
  name?: string;
  type?: string;
  hasContact?: boolean;
  
  // Return policy data
  returnDays?: number;
  returnMethod?: string;
  
  // Distribution data
  platform?: string;
  confidence?: string;
  indicators?: string[];
  feeds?: { url: string; type: string; source: string; productCount?: number }[];
  source?: string;
  format?: string;
  url?: string;
  
  // New 3-layer protocol structure
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
  
  // Payment and checkout detection
  paymentRails?: string[];
  checkoutApis?: string[];
  
  // Protocol manifests
  ucpReady?: boolean;
  mcpReady?: boolean;
  
  // Structured data completeness (P2)
  hasProduct?: boolean;
  hasOffer?: boolean;
  hasGtin?: boolean;
  
  // Generic
  isHttps?: boolean;
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
  discovery: { icon: Search, label: "Discovery", description: "AI agent visibility" },
  performance: { icon: Zap, label: "Performance", description: "Speed & Core Web Vitals" },
  transaction: { icon: CreditCard, label: "Transaction", description: "Purchase capability" },
  distribution: { icon: Radio, label: "Distribution", description: "Protocol & feed readiness" },
  trust: { icon: Shield, label: "Trust", description: "Business credibility" },
};

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Passed" },
  partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Partial" },
  fail: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
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

  // Platform detection check (P1)
  if (check.id === "P1" && data.platform) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
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
    );
  }

  // Structured Data Complete check (P2)
  if (check.id === "P2" && (data.hasProduct !== undefined || data.hasOffer !== undefined || data.hasGtin !== undefined)) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className={`text-xs ${data.hasProduct ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
          {data.hasProduct ? "✓" : "✗"} Product
        </Badge>
        <Badge variant="outline" className={`text-xs ${data.hasOffer ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
          {data.hasOffer ? "✓" : "✗"} Offer
        </Badge>
        <Badge variant="outline" className={`text-xs ${data.hasGtin ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
          {data.hasGtin ? "✓" : "⚠"} GTIN/SKU
        </Badge>
      </div>
    );
  }

  // Feed exists check (P3)
  if (check.id === "P3" && data.feeds && data.feeds.length > 0) {
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
      </div>
    );
  }

  // Feed discoverable check (P4)
  if (check.id === "P4" && data.source) {
    return (
      <div className="mt-3">
        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
          <Link className="h-3 w-3 mr-1" />
          via {data.source}
        </Badge>
      </div>
    );
  }

  // Feed accessible check (P5)
  if (check.id === "P5" && data.format) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
          {data.format.toUpperCase()} format
        </Badge>
        {data.url && (
          <Badge variant="outline" className="text-xs">
            {data.url}
          </Badge>
        )}
        {data.missingFields && data.missingFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full mt-1">
            <span className="text-xs text-warning mr-1">Missing:</span>
            {data.missingFields.map((field) => (
              <Badge key={field} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                {field}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Commerce API Indicators check (P6)
  if (check.id === "P6" && (data.paymentRails || data.checkoutApis)) {
    return (
      <div className="mt-3 space-y-2">
        {data.paymentRails && data.paymentRails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Payment Rails:</span>
            {data.paymentRails.map((rail) => (
              <Badge key={rail} variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                {rail === 'stripe' ? '💳 Stripe' : 
                 rail === 'shopifyCheckout' ? '🛒 Shopify' :
                 rail === 'googlePay' ? '🔷 Google Pay' :
                 rail === 'applePay' ? '🍎 Apple Pay' :
                 rail === 'klarna' ? '🟣 Klarna' :
                 rail === 'paypal' ? '💙 PayPal' : rail}
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
      </div>
    );
  }

  // Protocol Manifest check (P7) - 3-layer display
  if (check.id === "P7" && data.protocolReadiness) {
    const getStatusBadge = (status: string, label: string, reason: string) => {
      const statusClass = status === 'ready' 
        ? "bg-success/10 text-success border-success/20"
        : status === 'partial'
        ? "bg-warning/10 text-warning border-warning/20"
        : "bg-destructive/10 text-destructive border-destructive/20";
      const icon = status === 'ready' ? '✓' : status === 'partial' ? '⚠️' : '✗';
      
      return (
        <Badge 
          key={label} 
          variant="outline" 
          className={`text-xs ${statusClass}`}
          title={reason}
        >
          {icon} {label}
        </Badge>
      );
    };

    return (
      <div className="mt-3 space-y-4">
        {/* Discovery Layer */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Discovery Layer</p>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(data.protocolReadiness.discovery.googleShopping.status, 'Google Shopping', data.protocolReadiness.discovery.googleShopping.reason)}
            {getStatusBadge(data.protocolReadiness.discovery.klarnaApp.status, 'Klarna APP', data.protocolReadiness.discovery.klarnaApp.reason)}
            {getStatusBadge(data.protocolReadiness.discovery.answerEngines.status, 'Answer Engines', data.protocolReadiness.discovery.answerEngines.reason)}
          </div>
        </div>

        {/* Commerce Layer */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Commerce Layer</p>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(data.protocolReadiness.commerce.ucp.status, 'UCP', data.protocolReadiness.commerce.ucp.reason)}
            {getStatusBadge(data.protocolReadiness.commerce.acp.status, 'ACP (ChatGPT)', data.protocolReadiness.commerce.acp.reason)}
            {getStatusBadge(data.protocolReadiness.commerce.mcp.status, 'MCP', data.protocolReadiness.commerce.mcp.reason)}
          </div>
        </div>

        {/* Payment Rails */}
        {data.protocolReadiness.payments.rails.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Payment Rails</p>
            <div className="flex flex-wrap gap-2">
              {data.protocolReadiness.payments.rails.map((rail) => (
                <Badge key={rail} variant="outline" className="text-xs">
                  {rail === 'stripe' ? '💳 Stripe' : 
                   rail === 'shopifyCheckout' ? '🛒 Shopify' :
                   rail === 'googlePay' ? '🔷 Google Pay' :
                   rail === 'applePay' ? '🍎 Apple Pay' :
                   rail === 'klarna' ? '🟣 Klarna' :
                   rail === 'paypal' ? '💙 PayPal' : rail}
                </Badge>
              ))}
            </div>
          </div>
        )}
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

  // Sitemap check
  if (check.id === "D3" && data.urlCount) {
    return (
      <div className="mt-3">
        <Badge variant="outline" className="text-xs">
          <Globe className="h-3 w-3 mr-1" />
          {data.urlCount} URLs indexed
        </Badge>
      </div>
    );
  }

  // PageSpeed check
  if (check.id === "N1" && data.performanceScore !== undefined) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className={`text-xs ${
          data.performanceScore >= 90 ? "bg-success/10 text-success border-success/20" :
          data.performanceScore >= 50 ? "bg-warning/10 text-warning border-warning/20" :
          "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          Score: {data.performanceScore}/100
        </Badge>
        {data.lcp && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            LCP: {data.lcp}
          </Badge>
        )}
        {data.cls && (
          <Badge variant="outline" className="text-xs">
            CLS: {data.cls}
          </Badge>
        )}
        {data.tti && (
          <Badge variant="outline" className="text-xs">
            TTI: {data.tti}
          </Badge>
        )}
      </div>
    );
  }

  // Offer check
  if (check.id === "T1" && data.price) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
          <Tag className="h-3 w-3 mr-1" />
          {data.currency} {data.price}
        </Badge>
        {data.availability && (
          <Badge variant="outline" className="text-xs">
            {data.availability.replace("https://schema.org/", "")}
          </Badge>
        )}
      </div>
    );
  }

  // Organization check
  if (check.id === "R1" && data.name) {
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
      </div>
    );
  }

  // Return policy check
  if (check.id === "R2" && data.returnDays) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          {data.returnDays} day returns
        </Badge>
        {data.returnMethod && (
          <Badge variant="outline" className="text-xs">
            {data.returnMethod.replace("https://schema.org/", "")}
          </Badge>
        )}
      </div>
    );
  }

  return null;
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
    const partialCount = categoryChecks.filter(c => c.status === "partial").length;
    const failCount = categoryChecks.filter(c => c.status === "fail").length;
    return { category, score, max, checks: categoryChecks, passCount, partialCount, failCount };
  });

  // Sort categories in order: discovery, performance, transaction, distribution, trust
  const categoryOrder = ["discovery", "performance", "transaction", "distribution", "trust"];
  categoryScores.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Detailed Results</p>
        <h2 className="font-display text-2xl text-foreground">
          Individual Checks
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {checks.length} checks across {categoryScores.length} categories
        </p>
      </div>

      <Accordion type="multiple" defaultValue={categoryScores.filter(c => c.failCount > 0 || c.partialCount > 0).map(c => c.category)} className="border border-border divide-y divide-border">
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
                          <span className="text-warning">{partialCount} partial</span>
                        </>
                      )}
                      {failCount > 0 && (
                        <>
                          {(passCount > 0 || partialCount > 0) && <span className="text-muted-foreground">·</span>}
                          <span className="text-destructive">{failCount} failed</span>
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
                <div className="space-y-3 mt-2 ml-14">
                  {categoryChecks.map((check) => {
                    const status = statusConfig[check.status];
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={check.id}
                        className="p-4 bg-secondary/30 border border-border"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 flex items-center justify-center ${status.bg} flex-shrink-0`}>
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {check.name}
                                </span>
                                <Badge variant="outline" className={`text-xs ${status.bg} ${status.color} border-current/20`}>
                                  {status.label}
                                </Badge>
                              </div>
                              <span className="text-sm font-mono text-muted-foreground">
                                {check.score}/{check.maxScore}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {check.details}
                            </p>
                            <CheckDataDisplay check={check} />
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
