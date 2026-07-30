import { z } from "zod";

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().email("Valid email is required").max(255),
  password: z.string().min(8, "Password must be at least 8 characters long").max(128),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateMeBodySchema = z
  .object({
    activeRole: z.enum(["borrower", "lender"]).optional(),
    bio: z.string().max(2000).optional(),
    profilePhoto: z.string().max(2000).optional(),
    size: z
      .object({
        height: z.string().max(50).optional(),
        fitType: z.string().max(50).optional(),
        topSize: z.string().max(50).optional(),
        bottomSize: z.string().max(50).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
