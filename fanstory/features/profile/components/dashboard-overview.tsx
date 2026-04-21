import Link from "next/link";
import { BookOpenText, Coins, LockKeyhole, Save } from "lucide-react";
import type { DashboardView } from "@/entities/user/types";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCredits, formatRelativeDate } from "@/lib/utils";

type DashboardOverviewProps = {
  data: DashboardView;
};

export function DashboardOverview({ data }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title={`Welcome back, ${data.userName}`}
        description="Your profile is the operational center for stories, saves, purchases, balance and subscription status."
        actions={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories/new">Create story</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Stories"
          value={data.storyCount.toString()}
          hint="Interactive narratives currently owned by this account."
          icon={<BookOpenText className="size-4 text-slate-500" />}
        />
        <MetricCard
          label="Saves"
          value={data.saveCount.toString()}
          hint="Checkpoints available for reader resume and future branching."
          icon={<Save className="size-4 text-slate-500" />}
        />
        <MetricCard
          label="Balance"
          value={formatCredits(data.balance)}
          hint="Wallet is managed server-side, separate from UI actions."
          icon={<Coins className="size-4 text-slate-500" />}
        />
        <MetricCard
          label="Premium access"
          value={data.purchasedChapterCount.toString()}
          hint={data.activeSubscriptionName ?? "No active subscription"}
          icon={<LockKeyhole className="size-4 text-slate-500" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading text-2xl">
                Recent stories
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Latest story activity and current chapter progress.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/stories">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentStories.length ? (
              data.recentStories.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-950">{story.title}</p>
                    <p className="text-sm text-slate-500">
                      Chapter {story.currentChapterNumber} • updated{" "}
                      {formatRelativeDate(story.updatedAt)}
                    </p>
                  </div>
                  <Button asChild variant="ghost" className="rounded-full">
                    <Link href={`/stories/${story.id}/read`}>Open reader</Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="No stories yet"
                description="Create the first story to populate the dashboard, wallet flows and reader mode."
                action={
                  <Button
                    asChild
                    className="rounded-full bg-slate-950 hover:bg-slate-800"
                  >
                    <Link href="/stories/new">Create story</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/80">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Profile status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Account
              </p>
              <p className="text-sm font-medium text-slate-950">
                {data.userEmail}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Subscription
              </p>
              {data.activeSubscriptionName ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {data.activeSubscriptionName}
                </Badge>
              ) : (
                <Badge variant="secondary">No active plan</Badge>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Recent saves
              </p>
              {data.recentSaves.length ? (
                data.recentSaves.map((save) => (
                  <div
                    key={save.id}
                    className="rounded-3xl border border-slate-200/80 p-4"
                  >
                    <p className="font-medium text-slate-950">{save.label}</p>
                    <p className="text-sm text-slate-500">
                      {save.storyTitle} • chapter {save.chapterNumber}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Saves will appear after the first reader checkpoint is
                  created.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
