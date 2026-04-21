import { CreateStoryForm } from "@/features/stories/components/create-story-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewStoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Story generation"
        title="Create a new story"
        description="A new story creates a persisted aggregate with config, first chapter, choices and a run-state snapshot."
      />
      <CreateStoryForm />
    </div>
  );
}
