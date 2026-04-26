import "server-only";

import type {
  AdminGenerationLogsListView,
  AdminStoryDetailView,
  AdminStoriesListView,
} from "@/entities/admin/types";
import type { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import {
  adminEntityIdSchema,
  adminGenerationLogsQuerySchema,
  adminStoriesQuerySchema,
} from "@/lib/validations/admin";
import { requireAdmin } from "@/server/admin/admin-auth";
import {
  buildPagination,
  getPromptVersionModel,
} from "@/server/admin/shared";

function buildStorySearchWhere(query: string) {
  if (!query) {
    return {};
  }

  return {
    OR: [
      {
        id: {
          contains: query,
        },
      },
      {
        title: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
      {
        universe: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
      {
        owner: {
          email: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
      },
    ],
  };
}

export async function listAdminStories(
  payload: unknown,
): Promise<AdminStoriesListView> {
  await requireAdmin();
  const input = adminStoriesQuerySchema.parse(payload);
  const where = buildStorySearchWhere(input.query);
  const skip = (input.page - 1) * input.pageSize;

  const [totalCount, stories] = await Promise.all([
    prisma.story.count({
      where,
    }),
    prisma.story.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items: stories.map((story) => ({
      id: story.id,
      title: story.title,
      userId: story.owner.id,
      userEmail: story.owner.email,
      universe: story.universe,
      genre: story.genre,
      chapterCount: story._count.chapters,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    })),
    pagination: buildPagination({
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
    }),
    query: input.query,
  };
}

export async function getAdminStoryDetail(
  storyId: string,
): Promise<AdminStoryDetailView | null> {
  await requireAdmin();
  const input = adminEntityIdSchema.parse({
    id: storyId,
  });

  const story = await prisma.story.findUnique({
    where: {
      id: input.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
        },
      },
      runs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      chapters: {
        orderBy: {
          number: "asc",
        },
        include: {
          choices: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      decisions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      generationLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!story) {
    return null;
  }

  return {
    story: {
      id: story.id,
      title: story.title,
      synopsis: story.synopsis,
      status: story.status,
      userId: story.owner.id,
      userEmail: story.owner.email,
      universe: story.universe,
      protagonist: story.protagonist,
      theme: story.theme,
      genre: story.genre,
      tone: story.tone,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    },
    storyRun: story.runs[0]
      ? {
          id: story.runs[0].id,
          status: story.runs[0].status,
          provider: story.runs[0].provider,
          promptVersion: story.runs[0].promptVersion,
          currentChapterNumber: story.runs[0].currentChapterNumber,
          currentStateSummary: story.runs[0].currentStateSummary,
          lastChoiceSummary: story.runs[0].lastChoiceSummary,
          createdAt: story.runs[0].createdAt,
          updatedAt: story.runs[0].updatedAt,
        }
      : null,
    chapters: story.chapters.map((chapter) => ({
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      summary: chapter.summary,
      createdAt: chapter.createdAt,
      choices: chapter.choices.map((choice) => ({
        id: choice.id,
        key: choice.key,
        label: choice.label,
        outcomeHint: choice.outcomeHint,
        position: choice.position,
      })),
    })),
    decisions: story.decisions.map((decision) => ({
      id: decision.id,
      chapterNumber: decision.chapterNumber,
      selectedLabel: decision.selectedLabel,
      resolutionSummary: decision.resolutionSummary,
      createdAt: decision.createdAt,
    })),
    generationLogs: story.generationLogs.map((log) => ({
      id: log.id,
      userId: log.user.id,
      userEmail: log.user.email,
      storyId: log.storyId,
      storyTitle: story.title,
      storyRunId: log.storyRunId,
      provider: log.provider,
      model: getPromptVersionModel(log.promptVersion),
      eventType: log.eventType,
      status: log.status,
      errorMessage: log.errorMessage,
      promptVersion: log.promptVersion,
      createdAt: log.createdAt,
    })),
  };
}

export async function listAdminGenerationLogs(
  payload: unknown,
): Promise<AdminGenerationLogsListView> {
  await requireAdmin();
  const input = adminGenerationLogsQuerySchema.parse(payload);
  const skip = (input.page - 1) * input.pageSize;
  const where: Prisma.GenerationLogWhereInput = {};

  if (input.status) {
    where.status = input.status;
  }

  if (input.provider === "MOCK" || input.provider === "OPENAI") {
    where.provider = input.provider;
  }

  const [totalCount, logs] = await Promise.all([
    prisma.generationLog.count({
      where,
    }),
    prisma.generationLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        story: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items: logs.map((log) => ({
      id: log.id,
      userId: log.user.id,
      userEmail: log.user.email,
      storyId: log.storyId,
      storyTitle: log.story.title,
      storyRunId: log.storyRunId,
      provider: log.provider,
      model: getPromptVersionModel(log.promptVersion),
      eventType: log.eventType,
      status: log.status,
      errorMessage: log.errorMessage,
      promptVersion: log.promptVersion,
      createdAt: log.createdAt,
    })),
    pagination: buildPagination({
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
    }),
    status: input.status,
    provider: input.provider,
  };
}
