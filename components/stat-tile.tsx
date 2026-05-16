import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import InfoHint from "@/components/info-hint";
import { cn } from "@/lib/utils";

// Operational metric tile — one number, plainly labelled, with an optional
// "?" explanation so a manager never has to guess what a figure counts.

type Tone = "default" | "primary" | "info" | "warning";

const toneText: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  info: "text-blue-600",
  warning: "text-amber-600",
};

export default function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  sublabel,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  sublabel?: string;
  tone?: Tone;
}) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="section-label">{label}</span>
            {hint && <InfoHint label={label}>{hint}</InfoHint>}
          </div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className={cn("mt-2 text-3xl font-semibold tabular-nums", toneText[tone])}>
          {value}
        </p>
        {sublabel && (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
