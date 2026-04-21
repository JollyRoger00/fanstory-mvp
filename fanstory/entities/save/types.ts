export type SaveView = {
  id: string;
  storyId: string;
  storyTitle: string;
  label: string;
  chapterNumber: number;
  stateSummary: string;
  createdAt: Date;
  lastOpenedAt: Date | null;
};
