import { ExternalLink, ClipboardCheck } from "lucide-react";

interface ManualChecklistItem {
  id: string;
  name: string;
  description: string;
  checkUrl?: string;
  category: string;
}

const MANUAL_CHECKLIST: ManualChecklistItem[] = [
  {
    id: "MC1",
    name: "Klarna APP Enrollment",
    description: "Check if you are enrolled in the Klarna Agent Purchase Protocol (not the same as Klarna payment scripts)",
    checkUrl: "https://docs.klarna.com/agentic-commerce/",
    category: "transaction",
  },
  {
    id: "MC2",
    name: "Google AI Mode Shopping",
    description: "Verify your products appear in Google AI Mode shopping results",
    checkUrl: "https://merchants.google.com/",
    category: "trust",
  },
  {
    id: "MC3",
    name: "ChatGPT Shopping Integration",
    description: "Check if ChatGPT can surface your products for purchase",
    checkUrl: "https://chat.openai.com/",
    category: "transaction",
  },
  {
    id: "MC4",
    name: "Reddit Brand Presence",
    description: "Search Reddit for brand mentions and community engagement",
    checkUrl: "https://www.reddit.com/search/",
    category: "trust",
  },
  {
    id: "MC5",
    name: "Trustpilot Profile",
    description: "Verify your Trustpilot business profile is claimed and active",
    checkUrl: "https://business.trustpilot.com/",
    category: "trust",
  },
];

const ManualVerificationChecklist = () => {
  return (
    <section className="mt-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Manual Verification</p>
        </div>
        <h2 className="font-display text-2xl text-foreground">
          Checklist
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          These items require manual verification and are not included in your automated score.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MANUAL_CHECKLIST.map((item) => (
          <div
            key={item.id}
            className="border border-border p-4 bg-card hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 border border-border shrink-0">
                {item.category}
              </span>
            </div>
            {item.checkUrl && (
              <a
                href={item.checkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-foreground hover:text-foreground/80 transition-colors border border-border px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50"
              >
                Check Now
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ManualVerificationChecklist;
