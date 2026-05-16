"use client";

import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// A small "?" affordance — wherever the console uses a term a non-technical
// user might not know, this explains it in one plain sentence on hover.

export default function InfoHint({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`What does "${label}" mean?`}
        className="inline-flex text-muted-foreground/60 transition-colors hover:text-foreground"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
