import { eq, and, desc, count, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { uploadBuffer } from "../../config/cloudinary.js";
import { AppError } from "../../shared/errors/AppError.js";
import { createLogger } from "../../shared/logger/index.js";
import {
  ITEM_STATUS,
  ITEM_TOGGLE_STATUS,
} from "../../shared/constants/status.js";
import { items, savedItems } from "./item.schema.js";

const log = createLogger("items:service");

function parseSize(val) {
  if (!val) {
    log.debug("parseSize: empty value", { meta: { val } });
    return {};
  }
  try {
    const parsed = JSON.parse(val);
    log.debug("parseSize: parsed", { meta: { parsed } });
    return parsed;
  } catch {
    log.debug("parseSize: fallback to empty", { meta: { val } });
    return {};
  }
}

function parseInterviewTypes(val) {
  if (!val) {
    log.debug("parseInterviewTypes: empty value");
    return [];
  }
  try {
    const parsed = JSON.parse(val);
    const result = Array.isArray(parsed) ? parsed : [val];
    log.debug("parseInterviewTypes: parsed", { meta: { result } });
    return result;
  } catch {
    log.debug("parseInterviewTypes: fallback to single", { meta: { val } });
    return [val];
  }
}

function parseLenderDetails(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

function parseMeasurements(measurements) {
  if (measurements === undefined || measurements === null || measurements === "") {
    return {};
  }
  if (typeof measurements === "object") {
    return measurements;
  }
  try {
    return JSON.parse(measurements);
  } catch {
    throw AppError.badRequest("Invalid measurements JSON");
  }
}

export async function listMyItems(lenderId) {
  log.debug("listMyItems querying DB", { meta: { lenderId } });
  const result = await db
    .select()
    .from(items)
    .where(eq(items.lenderId, lenderId))
    .orderBy(desc(items.createdAt));
  log.debug("listMyItems returned", { meta: { count: result.length } });
  return result;
}

export async function listPublicFeed({ page, limit, size, category, interviewType }) {
  log.debug("listPublicFeed called", { meta: { page, limit, size, category, interviewType } });

  const conditions = [eq(items.status, ITEM_STATUS.AVAILABLE)];

  if (size) conditions.push(eq(items.sizeLabel, size));
  if (category) conditions.push(eq(items.category, category));
  if (interviewType) conditions.push(sql`${items.interviewTypes} @> ARRAY[${interviewType}::text]`);

  log.debug("listPublicFeed conditions built", { meta: { conditionCount: conditions.length } });

  const skip = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(items)
      .where(and(...conditions))
      .limit(limit)
      .offset(skip)
      .orderBy(desc(items.createdAt)),
    db.select({ value: count() }).from(items).where(and(...conditions)),
  ]);

  const total = countResult[0].value;

  log.debug("listPublicFeed result", { meta: { total, returned: data.length, page } });

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function createItem(lenderId, body, files = []) {
  log.debug("createItem: starting", { meta: { lenderId, bodyKeys: Object.keys(body), fileCount: files.length } });

  const imageUrls = [];

  for (const file of files) {
    if (!file.buffer) {
      log.warn("createItem: file missing buffer");
      throw AppError.badRequest("Invalid upload: expected in-memory file buffer");
    }
    const result = await uploadBuffer(file, "items");
    imageUrls.push(result.secure_url);
  }

  if (imageUrls.length === 0 && body.outfitImageUrl) {
    log.debug("createItem: using outfitImageUrl from body", { meta: { url: body.outfitImageUrl } });
    imageUrls.push(body.outfitImageUrl);
  }

  if (imageUrls.length === 0) {
    log.warn("createItem: no image source provided");
    throw AppError.badRequest("At least one image is required");
  }

  const parsedSize = parseSize(body.size);
  const parsedInterviewTypes = parseInterviewTypes(body.interviewTypes);

  log.debug("createItem: parsed data", {
    meta: {
      title: body.title,
      description: body.description,
      category: body.category,
      sizeLabel: parsedSize.topSize || parsedSize.bottomSize || "",
      interviewTypes: parsedInterviewTypes,
      fabricType: body.fabricType || null,
      measurementsKeys: Object.keys(parsedSize),
      imageCount: imageUrls.length,
    },
  });

  const parsedLenderDetails = parseLenderDetails(body.lenderDetails);

  const [item] = await db
    .insert(items)
    .values({
      lenderId,
      title: body.title || null,
      description: body.description || null,
      lenderDetails: parsedLenderDetails,
      category: body.category,
      sizeLabel: parsedSize.topSize || parsedSize.bottomSize || "",
      interviewTypes: parsedInterviewTypes,
      fabricType: body.fabricType || null,
      confidenceNote: body.confidenceNote || null,
      measurements: parsedSize,
      images: imageUrls,
      status: ITEM_STATUS.AVAILABLE,
    })
    .returning();

  log.debug("createItem: DB insert succeeded", { meta: { itemId: item.id } });

  return item;
}

export async function getItemById(id) {
  log.debug("getItemById", { meta: { id } });
  const [item] = await db.select().from(items).where(eq(items.id, id));
  if (!item) {
    log.warn("getItemById: not found", { meta: { id } });
    throw AppError.notFound("Item not found");
  }
  return item;
}

export async function listSavedItems(borrowerId) {
  log.debug("listSavedItems", { meta: { borrowerId } });
  const rows = await db
    .select({ item: items })
    .from(savedItems)
    .innerJoin(items, eq(savedItems.itemId, items.id))
    .where(eq(savedItems.borrowerId, borrowerId));

  const result = rows.map((row) => row.item);
  log.debug("listSavedItems result", { meta: { count: result.length } });
  return result;
}

export async function saveItem(borrowerId, itemId) {
  log.debug("saveItem: checking item exists", { meta: { itemId } });
  await getItemById(itemId);

  log.debug("saveItem: checking duplicate", { meta: { borrowerId, itemId } });
  const existing = await db
    .select({ id: savedItems.id })
    .from(savedItems)
    .where(and(eq(savedItems.borrowerId, borrowerId), eq(savedItems.itemId, itemId)));

  if (existing.length > 0) {
    log.warn("saveItem: already saved", { meta: { borrowerId, itemId } });
    throw AppError.badRequest("Item is already saved to your wishlist");
  }

  const [saved] = await db.insert(savedItems).values({ borrowerId, itemId }).returning();
  log.debug("saveItem: saved", { meta: { id: saved.id } });
  return saved;
}

export async function unsaveItem(borrowerId, itemId) {
  log.debug("unsaveItem", { meta: { borrowerId, itemId } });
  const deleted = await db
    .delete(savedItems)
    .where(and(eq(savedItems.borrowerId, borrowerId), eq(savedItems.itemId, itemId)))
    .returning();

  if (deleted.length === 0) {
    log.warn("unsaveItem: not found", { meta: { borrowerId, itemId } });
    throw AppError.notFound("Saved item not found in wishlist");
  }

  log.debug("unsaveItem: removed", { meta: { id: deleted[0].id } });
  return { message: "Item removed from wishlist" };
}

export async function deleteItem(lenderId, itemId) {
  log.debug("deleteItem: checking ownership", { meta: { lenderId, itemId } });
  const [item] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.lenderId, lenderId)));

  if (!item) {
    log.warn("deleteItem: not found or unauthorized", { meta: { lenderId, itemId } });
    throw AppError.notFound("Item not found or unauthorized");
  }

  await db.delete(items).where(eq(items.id, itemId));
  log.debug("deleteItem: done", { meta: { itemId } });
  return { message: "Item deleted successfully" };
}

export async function updateItemStatus(lenderId, itemId, status) {
  log.debug("updateItemStatus: checking ownership", { meta: { lenderId, itemId } });
  const [item] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.lenderId, lenderId)));

  if (!item) {
    log.warn("updateItemStatus: not found or unauthorized", { meta: { lenderId, itemId } });
    throw AppError.notFound("Item not found or unauthorized");
  }

  if (item.status === ITEM_STATUS.BORROWED) {
    log.warn("updateItemStatus: item is borrowed", { meta: { itemId } });
    throw AppError.badRequest("Cannot update status while the item is currently borrowed");
  }

  if (!ITEM_TOGGLE_STATUS.includes(status)) {
    log.warn("updateItemStatus: invalid status", { meta: { status } });
    throw AppError.badRequest("Invalid status. Must be Available or Unavailable.");
  }

  log.debug("updateItemStatus: updating", { meta: { itemId, from: item.status, to: status } });
  const [updated] = await db
    .update(items)
    .set({ status })
    .where(eq(items.id, itemId))
    .returning();

  log.debug("updateItemStatus: done", { meta: { itemId, newStatus: updated.status } });
  return updated;
}
