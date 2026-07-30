import { z } from "zod";
import {
  idParamSchema,
  conversationIdParamSchema,
  optionalPaginationQuerySchema,
} from "../../shared/validation/common.js";

export { idParamSchema, conversationIdParamSchema };

export const createRequestBodySchema = z.object({
  outfitId: z.coerce.number().int().positive(),
});

export const listRequestsQuerySchema = optionalPaginationQuerySchema.extend({
  status: z
    .enum([
      "pending",
      "approved",
      "agreement_pending",
      "rejected",
      "borrowed",
      "returned",
      "rated",
      "cancelled",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const messagesQuerySchema = optionalPaginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

export const sendMessageBodySchema = z.object({
  text: z.string().trim().min(1, "Message text is required").max(5000),
});

export const submitRatingBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
});
