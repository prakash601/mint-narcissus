import { eq, and, ne, inArray, count, desc, or } from "drizzle-orm";
import { db } from "../../config/database.js";
import { items } from "../items/item.schema.js";
import { users } from "../auth/auth.schema.js";
import { AppError } from "../../shared/errors/AppError.js";
import {
  BORROW_STATUS,
  COMPETING_STATUSES,
  ITEM_STATUS,
  canTransitionBorrow,
} from "../../shared/constants/status.js";
import {
  borrowRequests,
  conversations,
  messages,
  ratings,
} from "./rental.schema.js";

const postSystemMessage = async (executor, conversationId, senderId, text) => {
  await executor.insert(messages).values({
    conversationId,
    senderId,
    messageText: text,
    isSystemMessage: true,
  });
};

const isParticipant = (request, userId) =>
  request.borrowerId === userId || request.lenderId === userId;

function actorForRequest(request, userId) {
  if (request.lenderId === userId) return "lender";
  if (request.borrowerId === userId) return "borrower";
  return null;
}

function assertBorrowTransition(request, nextStatus, userId) {
  const actor = actorForRequest(request, userId);
  if (!actor) {
    throw AppError.forbidden("Access denied.");
  }
  const result = canTransitionBorrow(request.status, nextStatus, actor);
  if (!result.ok) {
    throw AppError.badRequest(result.message);
  }
  return actor;
}

/**
 * Running average update for a ratee.
 * exported for unit tests
 */
export function computeNewAverage(currentAvg, currentTotal, score) {
  const total = Number(currentTotal) || 0;
  const avg = Number(currentAvg) || 0;
  const nextTotal = total + 1;
  const nextAvg = (avg * total + score) / nextTotal;
  return {
    averageRating: Math.round(nextAvg * 100) / 100,
    totalRatings: nextTotal,
  };
}

async function applyRatingToUser(executor, rateeId, score) {
  const [ratee] = await executor
    .select({
      id: users.id,
      averageRating: users.averageRating,
      totalRatings: users.totalRatings,
    })
    .from(users)
    .where(eq(users.id, rateeId));

  if (!ratee) {
    throw AppError.notFound("Rated user not found.");
  }

  const next = computeNewAverage(ratee.averageRating, ratee.totalRatings, score);

  await executor
    .update(users)
    .set({
      averageRating: next.averageRating,
      totalRatings: next.totalRatings,
      updatedAt: new Date(),
    })
    .where(eq(users.id, rateeId));

  return next;
}

async function getRequestOrThrow(id) {
  const [request] = await db.select().from(borrowRequests).where(eq(borrowRequests.id, id));
  if (!request) {
    throw AppError.notFound("Request not found.");
  }
  return request;
}

async function assertConversationAccess(conversationId, userId) {
  const rows = await db
    .select({
      conversation: conversations,
      request: borrowRequests,
    })
    .from(conversations)
    .innerJoin(borrowRequests, eq(conversations.borrowRequestId, borrowRequests.id))
    .where(eq(conversations.id, conversationId));

  if (rows.length === 0) {
    throw AppError.notFound("Conversation not found.");
  }

  const { conversation, request } = rows[0];

  if (!isParticipant(request, userId)) {
    throw AppError.forbidden("Access denied.");
  }

  return { conversation, request };
}

/** Used by Socket.io to authorize room joins */
export async function userCanAccessConversation(userId, conversationId) {
  try {
    await assertConversationAccess(conversationId, userId);
    return true;
  } catch {
    return false;
  }
}

export async function createRequest(userId, outfitId) {
  const [item] = await db.select().from(items).where(eq(items.id, outfitId));

  if (!item) {
    throw AppError.notFound("Outfit not found.");
  }

  if (item.status !== ITEM_STATUS.AVAILABLE) {
    throw AppError.badRequest("This outfit is not available for borrowing.");
  }

  if (item.lenderId === userId) {
    throw AppError.badRequest("You cannot request your own outfit.");
  }

  const existing = await db
    .select({ id: borrowRequests.id })
    .from(borrowRequests)
    .where(
      and(
        eq(borrowRequests.itemId, outfitId),
        eq(borrowRequests.borrowerId, userId),
        eq(borrowRequests.status, BORROW_STATUS.PENDING),
      ),
    );

  if (existing.length > 0) {
    throw AppError.badRequest("You already have a pending request for this outfit.");
  }

  const [request] = await db
    .insert(borrowRequests)
    .values({
      itemId: outfitId,
      borrowerId: userId,
      lenderId: item.lenderId,
      status: BORROW_STATUS.PENDING,
    })
    .returning();

  return request;
}

export async function listIncomingRequests(userId, { page, limit, status }) {
  const filterConditions = [eq(borrowRequests.lenderId, userId)];
  if (status) filterConditions.push(eq(borrowRequests.status, status));

  const skip = (page - 1) * limit;

  const [requests, totalResult] = await Promise.all([
    db
      .select()
      .from(borrowRequests)
      .where(and(...filterConditions))
      .orderBy(desc(borrowRequests.createdAt))
      .limit(limit)
      .offset(skip),
    db.select({ value: count() }).from(borrowRequests).where(and(...filterConditions)),
  ]);

  const total = totalResult[0].value;
  return {
    requests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
  };
}

export async function listMyRequests(userId, { page, limit, status }) {
  const filterConditions = [eq(borrowRequests.borrowerId, userId)];
  if (status) filterConditions.push(eq(borrowRequests.status, status));

  const skip = (page - 1) * limit;

  const [requests, totalResult] = await Promise.all([
    db
      .select()
      .from(borrowRequests)
      .where(and(...filterConditions))
      .orderBy(desc(borrowRequests.createdAt))
      .limit(limit)
      .offset(skip),
    db.select({ value: count() }).from(borrowRequests).where(and(...filterConditions)),
  ]);

  const total = totalResult[0].value;
  return {
    requests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
  };
}

export async function getRequestById(userId, id) {
  const request = await getRequestOrThrow(id);

  if (!isParticipant(request, userId)) {
    throw AppError.forbidden("Access denied.");
  }

  return request;
}

export async function approveRequest(userId, id) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(borrowRequests).where(eq(borrowRequests.id, id));

    if (!request) {
      throw AppError.notFound("Request not found.");
    }

    assertBorrowTransition(request, BORROW_STATUS.APPROVED, userId);

    const [updatedRequest] = await tx
      .update(borrowRequests)
      .set({ status: BORROW_STATUS.APPROVED })
      .where(eq(borrowRequests.id, id))
      .returning();

    const [conversation] = await tx
      .insert(conversations)
      .values({ borrowRequestId: id, isActive: true })
      .returning();

    await postSystemMessage(
      tx,
      conversation.id,
      userId,
      "Request approved — chat is now open. Please discuss handover details here.",
    );

    return { request: updatedRequest, conversationId: conversation.id };
  });
}

export async function rejectRequest(userId, id) {
  const request = await getRequestOrThrow(id);
  assertBorrowTransition(request, BORROW_STATUS.REJECTED, userId);

  const [updated] = await db
    .update(borrowRequests)
    .set({ status: BORROW_STATUS.REJECTED })
    .where(eq(borrowRequests.id, id))
    .returning();

  return updated;
}

export async function cancelRequest(userId, id) {
  const request = await getRequestOrThrow(id);
  assertBorrowTransition(request, BORROW_STATUS.CANCELLED, userId);

  const [updated] = await db
    .update(borrowRequests)
    .set({ status: BORROW_STATUS.CANCELLED })
    .where(eq(borrowRequests.id, id))
    .returning();

  return updated;
}

export async function confirmLend(userId, id) {
  const request = await getRequestOrThrow(id);
  assertBorrowTransition(request, BORROW_STATUS.AGREEMENT_PENDING, userId);

  const [updated] = await db
    .update(borrowRequests)
    .set({ status: BORROW_STATUS.AGREEMENT_PENDING })
    .where(eq(borrowRequests.id, id))
    .returning();

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.borrowRequestId, id));

  if (conversation) {
    await postSystemMessage(
      db,
      conversation.id,
      userId,
      "The lender has confirmed they'd like to proceed. Please review and accept the lending agreement to finalise the arrangement.",
    );
  }

  return updated;
}

export async function acceptAgreement(userId, id) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(borrowRequests).where(eq(borrowRequests.id, id));

    if (!request) {
      throw AppError.notFound("Request not found.");
    }

    assertBorrowTransition(request, BORROW_STATUS.BORROWED, userId);

    const now = new Date();
    const [updatedRequest] = await tx
      .update(borrowRequests)
      .set({
        status: BORROW_STATUS.BORROWED,
        agreementAcceptedAt: now,
        borrowedAt: now,
      })
      .where(eq(borrowRequests.id, id))
      .returning();

    await tx
      .update(items)
      .set({ status: ITEM_STATUS.BORROWED })
      .where(eq(items.id, request.itemId));

    await tx
      .update(borrowRequests)
      .set({ status: BORROW_STATUS.REJECTED })
      .where(
        and(
          eq(borrowRequests.itemId, request.itemId),
          ne(borrowRequests.id, id),
          inArray(borrowRequests.status, [...COMPETING_STATUSES]),
        ),
      );

    const [conversation] = await tx
      .select()
      .from(conversations)
      .where(eq(conversations.borrowRequestId, id));

    if (conversation) {
      await postSystemMessage(
        tx,
        conversation.id,
        userId,
        "Agreement accepted. The outfit is now officially on loan — please coordinate handover details here.",
      );
    }

    return updatedRequest;
  });
}

export async function markReturned(userId, id) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(borrowRequests).where(eq(borrowRequests.id, id));

    if (!request) {
      throw AppError.notFound("Request not found.");
    }

    assertBorrowTransition(request, BORROW_STATUS.RETURNED, userId);

    const now = new Date();
    const [updatedRequest] = await tx
      .update(borrowRequests)
      .set({
        status: BORROW_STATUS.RETURNED,
        returnedAt: now,
        ratingsPending: true,
      })
      .where(eq(borrowRequests.id, id))
      .returning();

    await tx
      .update(items)
      .set({ status: ITEM_STATUS.AVAILABLE })
      .where(eq(items.id, request.itemId));

    const [closedConversation] = await tx
      .update(conversations)
      .set({ isActive: false, updatedAt: now })
      .where(eq(conversations.borrowRequestId, id))
      .returning();

    if (closedConversation) {
      await postSystemMessage(
        tx,
        closedConversation.id,
        userId,
        "Item returned — the chat is now closed. Please take a moment to rate your experience.",
      );
    }

    return updatedRequest;
  });
}

export async function submitRating(userId, id, score) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(borrowRequests).where(eq(borrowRequests.id, id));

    if (!request) {
      throw AppError.notFound("Request not found.");
    }

    if (request.status !== BORROW_STATUS.RETURNED) {
      throw AppError.badRequest("Ratings can only be submitted after the item is returned.");
    }
    if (!request.ratingsPending) {
      throw AppError.badRequest("Ratings are not open for this request.");
    }

    const isLender = request.lenderId === userId;
    const isBorrower = request.borrowerId === userId;

    if (!isLender && !isBorrower) {
      throw AppError.forbidden("Access denied.");
    }
    if (isLender && request.lenderRated) {
      throw AppError.badRequest("You have already submitted your rating.");
    }
    if (isBorrower && request.borrowerRated) {
      throw AppError.badRequest("You have already submitted your rating.");
    }

    const rateeId = isLender ? request.borrowerId : request.lenderId;

    const existing = await tx
      .select({ id: ratings.id })
      .from(ratings)
      .where(and(eq(ratings.borrowRequestId, id), eq(ratings.raterId, userId)));

    if (existing.length > 0) {
      throw AppError.badRequest("You have already submitted your rating.");
    }

    await tx.insert(ratings).values({
      borrowRequestId: id,
      raterId: userId,
      rateeId,
      score,
    });

    await applyRatingToUser(tx, rateeId, score);

    const ratingFlags = isLender ? { lenderRated: true } : { borrowerRated: true };
    const [afterRate] = await tx
      .update(borrowRequests)
      .set(ratingFlags)
      .where(eq(borrowRequests.id, id))
      .returning();

    if (afterRate.lenderRated && afterRate.borrowerRated) {
      const [closed] = await tx
        .update(borrowRequests)
        .set({ ratingsPending: false, status: BORROW_STATUS.RATED })
        .where(eq(borrowRequests.id, id))
        .returning();
      return closed;
    }

    return afterRate;
  });
}

export async function listConversations(userId) {
  return db
    .select({
      conversation: conversations,
      request: borrowRequests,
    })
    .from(conversations)
    .innerJoin(borrowRequests, eq(conversations.borrowRequestId, borrowRequests.id))
    .where(
      and(
        eq(conversations.isActive, true),
        or(eq(borrowRequests.borrowerId, userId), eq(borrowRequests.lenderId, userId)),
      ),
    )
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationHistory(userId, conversationId, { page, limit }) {
  const access = await assertConversationAccess(conversationId, userId);
  const skip = (page - 1) * limit;

  const [messagesResult, totalResult] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(skip),
    db
      .select({ value: count() })
      .from(messages)
      .where(eq(messages.conversationId, conversationId)),
  ]);

  return {
    conversation: access.conversation,
    request: access.request,
    messages: messagesResult.reverse(),
    pagination: {
      page,
      limit,
      total: totalResult[0].value,
      pages: Math.ceil(totalResult[0].value / limit) || 0,
    },
  };
}

export async function sendMessage(userId, conversationId, text, io) {
  const access = await assertConversationAccess(conversationId, userId);

  if (!access.conversation.isActive) {
    throw AppError.forbidden("This conversation is closed.");
  }

  const trimmed = text.trim();
  const now = new Date();

  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      messageText: trimmed,
    })
    .returning();

  await db
    .update(conversations)
    .set({
      lastMessage: trimmed,
      isRead: false,
      updatedAt: now,
    })
    .where(eq(conversations.id, conversationId));

  if (io) {
    io.to(String(conversationId)).emit("new_message", {
      conversationId,
      message,
    });
  }

  return message;
}

export async function markConversationRead(userId, conversationId) {
  await assertConversationAccess(conversationId, userId);

  await db
    .update(conversations)
    .set({ isRead: true, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return { message: "Marked as read." };
}
