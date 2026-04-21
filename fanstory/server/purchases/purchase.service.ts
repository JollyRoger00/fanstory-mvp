import "server-only";

import { prisma } from "@/lib/db/client";
import { purchaseChapterSchema } from "@/lib/validations/story";
import { getChapterAccessState } from "@/server/access/access.service";
import { ensureWalletRecord } from "@/server/wallet/wallet.service";

export async function purchaseChapterAccess(userId: string, payload: unknown) {
  const input = purchaseChapterSchema.parse(payload);

  const story = await prisma.story.findFirstOrThrow({
    where: {
      id: input.storyId,
      userId,
    },
    include: {
      runs: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const accessState = await getChapterAccessState({
    userId,
    storyId: story.id,
    chapterNumber: input.chapterNumber,
    priceCredits: story.accessPrice,
  });

  if (accessState.allowed) {
    return accessState;
  }

  await prisma.$transaction(async (tx) => {
    const wallet = await ensureWalletRecord(tx, userId);

    if (wallet.balance < accessState.priceCredits) {
      throw new Error("Not enough credits to unlock this chapter.");
    }

    const purchase = await tx.purchase.create({
      data: {
        userId,
        walletId: wallet.id,
        storyId: story.id,
        type: "CHAPTER",
        status: "COMPLETED",
        amount: accessState.priceCredits,
        chapterNumber: input.chapterNumber,
        description: `Unlocked chapter ${input.chapterNumber} for ${story.title}.`,
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: accessState.priceCredits,
        },
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        purchaseId: purchase.id,
        type: "CHAPTER_PURCHASE",
        amount: -accessState.priceCredits,
        balanceAfter: updatedWallet.balance,
        description: `Chapter ${input.chapterNumber} unlocked for ${story.title}.`,
      },
    });

    await tx.purchasedChapterAccess.create({
      data: {
        userId,
        storyId: story.id,
        storyRunId: story.runs[0]?.id,
        purchaseId: purchase.id,
        chapterNumber: input.chapterNumber,
      },
    });
  });

  return getChapterAccessState({
    userId,
    storyId: story.id,
    chapterNumber: input.chapterNumber,
    priceCredits: story.accessPrice,
  });
}
