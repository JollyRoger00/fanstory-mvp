import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-300 bg-white/70">
      <CardContent className="flex flex-col items-start gap-4 py-8">
        <div className="space-y-2">
          <h3 className="font-heading text-2xl text-slate-950">{title}</h3>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
