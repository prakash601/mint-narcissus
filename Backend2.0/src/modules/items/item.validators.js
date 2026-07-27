import { z } from "zod";
import { idParamSchema, optionalPaginationQuerySchema } from "../../shared/validation/common.js";

export { idParamSchema };

export const feedQuerySchema = optionalPaginationQuerySchema.extend({
  size: z.string().optional(),
  category: z.string().optional(),
  interviewType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// Multipart form fields arrive as strings
export const createItemBodySchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  description: z.string().trim().min(1, "description is required"),
  lenderDetails: z.string().trim().min(1, "lenderDetails is required"),
  category: z.string().trim().min(1, "category is required"),
  size: z.string().trim().min(1, "size is required"),
  interviewTypes: z.string().trim().min(1, "interviewTypes is required"),
  outfitImageUrl: z.string().url().optional(),
  fabricType: z.string().trim().optional(),
  confidenceNote: z.string().trim().optional(),
  measurements: z
    .union([
      z.string(),
      z.record(z.string(), z.unknown()),
    ])
    .optional(),
});

export const updateItemStatusBodySchema = z.object({
  status: z.enum(["Available", "Unavailable"]),
});
