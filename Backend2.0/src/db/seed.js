import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { db, pool } = await import("../config/database.js");
const { users, userSizes } = await import("../modules/auth/auth.schema.js");
const { items, savedItems } = await import("../modules/items/item.schema.js");
const {
  borrowRequests,
  conversations,
  messages,
  ratings,
} = await import("../modules/rental/rental.schema.js");
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const USER_COUNT = 50;
const PASSWORD = "password123";

const FIRST_NAMES = [
  "Ava", "Priya", "Maya", "Jordan", "Sofia", "Ethan", "Nina", "Marcus", "Leila", "Omar",
  "Grace", "Diego", "Chloe", "Rahul", "Zara", "Liam", "Amara", "Noah", "Ingrid", "Tara",
  "Felix", "Naomi", "Arjun", "Bella", "Caleb",
];
const LAST_NAMES = [
  "Sharma", "Chen", "Patel", "Kim", "Okafor", "Rivera", "Novak", "Singh", "Muller", "Hassan",
  "Johnson", "Garcia", "Lee", "Brown", "Silva", "Kumar", "Nguyen", "Davis", "Rossi", "Cohen",
];

const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Blazers", "Suits", "Shoes", "Accessories"];
const INTERVIEW_TYPES = ["Finance", "Consulting", "Tech", "Marketing", "Law", "Healthcare", "Graduate School"];
const HEIGHTS = ["Short", "Regular", "Tall"];
const FIT_TYPES = ["Slim", "Regular", "Relaxed"];
const TOP_SIZES = ["S", "M", "L", "XL"];
const BOTTOM_SIZES = ["28", "30", "32", "34"];

const BIOS = [
  "Product analyst prepping for consulting interviews.",
  "Career switcher diving into finance.",
  "New grad navigating my first tech interviews.",
  "Believe everyone deserves to look sharp on the big day.",
  "Marketing professional paying it forward.",
  "Interview outfit hoarder — happy to share.",
  "Law student in need of power suits.",
  "Lending my interview wardrobe to the community.",
];
const TITLES = [
  "Classic Navy Blazer", "Charcoal Suit", "White Button-Down", "Pencil Skirt",
  "Tailored Trousers", "Sheath Dress", "Silk Blouse", "Wool Overcoat",
  "Leather Oxfords", "Structured Tote", "Knit Cardigan", "Pleated Skirt",
  "Slim Dress Shirt", "Khaki Chinos", "Statement Necklace", "Grey Slacks",
];
const FABRICS = ["Wool blend", "Cotton", "Polyester", "Linen", "Silk", null];
const CONFIDENCE_NOTES = [
  "Worn to land my dream job — good luck!",
  "Professionally dry-cleaned after every wear.",
  "Runs slightly large, consider sizing down.",
  null,
];

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Seeding mint-narcissus dev database…");

  await db.execute(sql`
    TRUNCATE auth.users, auth.user_sizes, catalog.items, catalog.saved_items,
    rental.borrow_requests, rental.conversations, rental.messages, rental.ratings
    RESTART IDENTITY CASCADE
  `);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ---- 50 users ----
  const usedNames = new Set();
  const userRows = [];
  while (userRows.length < USER_COUNT) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);

    const isLender = userRows.length < 20;
    userRows.push({
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      passwordHash,
      activeRole: isLender ? "lender" : "borrower",
      isProfileComplete: true,
      profilePhoto: `https://i.pravatar.cc/150?img=${(userRows.length % 70) + 1}`,
      bio: pick(BIOS),
      averageRating: 0,
      totalRatings: 0,
      createdAt: daysAgo(rand(300) + 30),
    });
  }
  const insertedUsers = await db.insert(users).values(userRows).returning();
  console.log(`  users: ${insertedUsers.length}`);

  await db.insert(userSizes).values(
    insertedUsers.map((u) => ({
      userId: u.id,
      height: pick(HEIGHTS),
      fitType: pick(FIT_TYPES),
      topSize: pick(TOP_SIZES),
      bottomSize: pick(BOTTOM_SIZES),
    })),
  );

  // ---- items (each lender lists 2-4) ----
  const lenders = insertedUsers.filter((u) => u.activeRole === "lender");
  const borrowers = insertedUsers.filter((u) => u.activeRole === "borrower");
  const itemRows = [];
  let img = 0;
  for (const lender of lenders) {
    const count = 2 + rand(3);
    for (let i = 0; i < count; i++) {
      img += 1;
      const topSize = pick(TOP_SIZES);
      const category = pick(CATEGORIES);
      const sizeLabel = category === "Bottoms" ? pick(BOTTOM_SIZES) : topSize;
      itemRows.push({
        lenderId: lender.id,
        title: `${pick(["Navy", "Charcoal", "Black", "Beige", "Grey"])} ${pick(TITLES)}`,
        description: `${category} in great condition, ideal for interviews.`,
        lenderDetails: JSON.stringify({ name: lender.name, photo: lender.profilePhoto }),
        category,
        sizeLabel,
        interviewTypes: [pick(INTERVIEW_TYPES), pick(INTERVIEW_TYPES)].filter(
          (v, idx, arr) => arr.indexOf(v) === idx,
        ),
        fabricType: pick(FABRICS),
        confidenceNote: pick(CONFIDENCE_NOTES),
        status: "Available",
        images: [
          `https://picsum.photos/seed/outfit${img}/600/800`,
          `https://picsum.photos/seed/outfit${img}b/600/800`,
        ],
        measurements: JSON.stringify({
          topSize,
          bottomSize: pick(BOTTOM_SIZES),
          height: pick(HEIGHTS),
          fitType: pick(FIT_TYPES),
        }),
        createdAt: daysAgo(rand(90)),
      });
    }
  }
  const insertedItems = await db.insert(items).values(itemRows).returning();
  console.log(`  items: ${insertedItems.length}`);

  // ---- wishlist saves ----
  const savePairs = new Set();
  const saveRows = [];
  for (let i = 0; i < 40; i++) {
    const b = pick(borrowers);
    const item = pick(insertedItems);
    if (item.lenderId === b.id) continue;
    const key = `${b.id}:${item.id}`;
    if (savePairs.has(key)) continue;
    savePairs.add(key);
    saveRows.push({ borrowerId: b.id, itemId: item.id });
  }
  if (saveRows.length > 0) {
    await db.insert(savedItems).values(saveRows);
  }
  console.log(`  saved items: ${saveRows.length}`);

  // ---- borrow requests across all lifecycle stages ----
  const STATUS_PLAN = [
    ...Array(6).fill("pending"),
    ...Array(5).fill("approved"),
    ...Array(4).fill("agreement_pending"),
    ...Array(5).fill("borrowed"),
    ...Array(4).fill("returned"),
    ...Array(8).fill("rated"),
    ...Array(4).fill("rejected"),
    ...Array(4).fill("cancelled"),
  ];

  const SYSTEM_MESSAGES = {
    approved: "Request approved — chat is now open. Please discuss handover details here.",
    agreement_pending:
      "The lender has confirmed they'd like to proceed. Please review and accept the lending agreement to finalise the arrangement.",
    borrowed:
      "Agreement accepted. The outfit is now officially on loan — please coordinate handover details here.",
    returned: "Item returned — the chat is now closed. Please take a moment to rate your experience.",
  };

  const CHATS = [
    ["Hi! Is this still available for next week?", "Yes! Pickup Thursday evening work?"],
    ["Could I try it on before accepting?", "Of course — come by anytime after 5pm."],
    ["Thank you so much, returning it Friday!", "No rush, good luck with the interview!"],
  ];

  const requestRows = [];
  const usedItems = new Set();
  for (const status of STATUS_PLAN) {
    let item = pick(insertedItems);
    let guard = 0;
    while ((usedItems.has(item.id) || item.status !== "Available") && guard++ < 50) {
      item = pick(insertedItems);
    }
    if (usedItems.has(item.id)) continue;
    usedItems.add(item.id);

    const borrower = pick(borrowers);
    if (borrower.id === item.lenderId) continue;

    const createdDaysAgo = 5 + rand(50);
    const row = {
      itemId: item.id,
      borrowerId: borrower.id,
      lenderId: item.lenderId,
      status,
      createdAt: daysAgo(createdDaysAgo),
    };
    if (["agreement_pending", "borrowed", "returned", "rated"].includes(status)) {
      row.agreementAcceptedAt = status === "agreement_pending" ? null : daysAgo(createdDaysAgo - 2);
      row.borrowedAt = status === "agreement_pending" ? null : daysAgo(createdDaysAgo - 2);
    }
    if (["returned", "rated"].includes(status)) {
      row.returnedAt = daysAgo(Math.max(createdDaysAgo - 4, 1));
      row.ratingsPending = true;
    }

    if (status === "borrowed") {
      item.status = "Borrowed";
    }
    requestRows.push({ row, hasChat: status !== "pending" && status !== "rejected" && status !== "cancelled" });
  }

  const insertedRequests = [];
  for (const { row } of requestRows) {
    const [inserted] = await db.insert(borrowRequests).values(row).returning();
    insertedRequests.push(inserted);
  }
  console.log(`  borrow requests: ${insertedRequests.length}`);

  await Promise.all(
    Object.entries(
      insertedRequests.reduce((acc, r) => {
        if (r.status === "borrowed") acc[r.itemId] = "Borrowed";
        return acc;
      }, {}),
    ).map(([itemId, status]) =>
      db.update(items).set({ status }).where(sql`${items.id} = ${Number(itemId)}`),
    ),
  );

  // ---- conversations + messages for post-approval requests ----
  const convoRows = insertedRequests
    .filter((r) => !["pending", "rejected", "cancelled"].includes(r.status))
    .map((r) => ({ borrowRequestId: r.id, isActive: r.status !== "returned" && r.status !== "rated" }));
  const insertedConvos =
    convoRows.length > 0 ? await db.insert(conversations).values(convoRows).returning() : [];

  const msgRows = [];
  for (const convo of insertedConvos) {
    const req = insertedRequests.find((r) => r.id === convo.borrowRequestId);
    msgRows.push({
      conversationId: convo.id,
      senderId: req.lenderId,
      messageText: SYSTEM_MESSAGES[req.status] || SYSTEM_MESSAGES.approved,
      isSystemMessage: true,
      createdAt: req.updatedAt || req.createdAt,
    });

    if (!["rated"].includes(req.status)) {
      const chat = pick(CHATS);
      chat.forEach((text, i) => {
        msgRows.push({
          conversationId: convo.id,
          senderId: i === 0 ? req.borrowerId : req.lenderId,
          messageText: text,
          isSystemMessage: false,
          createdAt: new Date(daysAgo(Math.max(rand(10), 1)).getTime() + i * 60 * 1000),
        });
      });
    }
  }
  if (msgRows.length > 0) {
    await db.insert(messages).values(msgRows);
  }
  console.log(`  conversations: ${insertedConvos.length}, messages: ${msgRows.length}`);

  // ---- ratings (both sides for rated, one side for half of returned) ----
  const ratingRows = [];
  for (const req of insertedRequests) {
    if (req.status === "rated") {
      ratingRows.push(
        { borrowRequestId: req.id, raterId: req.borrowerId, rateeId: req.lenderId, score: 3 + rand(3), createdAt: req.returnedAt },
        { borrowRequestId: req.id, raterId: req.lenderId, rateeId: req.borrowerId, score: 3 + rand(3), createdAt: req.returnedAt },
      );
    } else if (req.status === "returned" && Math.random() < 0.5) {
      ratingRows.push(
        Math.random() < 0.5
          ? { borrowRequestId: req.id, raterId: req.borrowerId, rateeId: req.lenderId, score: 3 + rand(3) }
          : { borrowRequestId: req.id, raterId: req.lenderId, rateeId: req.borrowerId, score: 3 + rand(3) },
      );
    }
  }
  if (ratingRows.length > 0) {
    await db.insert(ratings).values(ratingRows);
  }

  // sync aggregate fields on users + mark who has rated what
  for (const req of insertedRequests) {
    if (req.status !== "rated" && req.status !== "returned") continue;
    const flags = {};
    if (ratingRows.some((r) => r.borrowRequestId === req.id && r.raterId === req.borrowerId)) {
      flags.borrowerRated = true;
    }
    if (ratingRows.some((r) => r.borrowRequestId === req.id && r.raterId === req.lenderId)) {
      flags.lenderRated = true;
    }
    if (req.status === "rated") {
      flags.ratingsPending = false;
    } else if (flags.borrowerRated && flags.lenderRated) {
      flags.ratingsPending = false;
      flags.status = "rated";
    }
    if (Object.keys(flags).length > 0) {
      await db.update(borrowRequests).set(flags).where(sql`${borrowRequests.id} = ${req.id}`);
    }
  }

  const agg = await db.execute(sql`
    UPDATE auth.users u SET
      average_rating = COALESCE(sub.avg_score, 0),
      total_ratings = COALESCE(sub.cnt, 0)
    FROM (
      SELECT ratee_id, ROUND(AVG(score)::numeric, 2)::real AS avg_score, COUNT(*) AS cnt
      FROM rental.ratings GROUP BY ratee_id
    ) sub
    WHERE u.id = sub.ratee_id
  `);
  console.log(`  ratings: ${ratingRows.length} (aggregates synced)`);

  const [{ count: userCount }] = (
    await db.execute(sql`SELECT COUNT(*)::int AS count FROM auth.users`)
  ).rows;
  console.log(`Done — ${userCount} users ready. Login with any seeded email + "${PASSWORD}"`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
