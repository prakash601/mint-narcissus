import express from "express";
import * as itemController from "./item.controller.js";
import upload from "./upload.utils.js";
import { auth, requireProfileComplete, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  idParamSchema,
  feedQuerySchema,
  createItemBodySchema,
  updateItemStatusBodySchema,
} from "./item.validators.js";

const router = express.Router();

router.get(
  "/saved",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  itemController.getSavedItems,
);

router.get(
  "/my",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  itemController.getMyItems,
);

router.get(
  "/",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ query: feedQuerySchema }),
  itemController.getPublicFeed,
);

router.post(
  "/",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  upload.array("images", 5),
  validate({ body: createItemBodySchema }),
  itemController.createItem,
);

router.delete(
  "/:id",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema }),
  itemController.deleteItem,
);

router.get("/:id", auth, validate({ params: idParamSchema }), itemController.getItemById);

router.post(
  "/:id/save",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ params: idParamSchema }),
  itemController.saveItem,
);

router.delete(
  "/:id/save",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ params: idParamSchema }),
  itemController.unsaveItem,
);

router.patch(
  "/:id/status",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema, body: updateItemStatusBodySchema }),
  itemController.updateItemStatus,
);

export default router;
