import express from "express";
import * as rentalController from "./rental.controller.js";
import { auth, requireProfileComplete, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  idParamSchema,
  conversationIdParamSchema,
  createRequestBodySchema,
  listRequestsQuerySchema,
  messagesQuerySchema,
  sendMessageBodySchema,
  submitRatingBodySchema,
} from "./rental.validators.js";

const router = express.Router();

router.post(
  "/request",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ body: createRequestBodySchema }),
  rentalController.createRequest,
);

router.get(
  "/requests/incoming",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ query: listRequestsQuerySchema }),
  rentalController.getIncomingRequests,
);

router.get(
  "/requests/my-requests",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ query: listRequestsQuerySchema }),
  rentalController.getMyRequests,
);

router.get("/conversations", auth, requireProfileComplete, rentalController.getConversations);

router.get(
  "/requests/:id",
  auth,
  requireProfileComplete,
  validate({ params: idParamSchema }),
  rentalController.getRequestById,
);

router.patch(
  "/requests/:id/approve",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema }),
  rentalController.approveRequest,
);

router.patch(
  "/requests/:id/reject",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema }),
  rentalController.rejectRequest,
);

router.patch(
  "/requests/:id/cancel",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ params: idParamSchema }),
  rentalController.cancelRequest,
);

router.patch(
  "/requests/:id/confirm-lend",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema }),
  rentalController.confirmLend,
);

router.post(
  "/requests/:id/agreement",
  auth,
  requireProfileComplete,
  requireRole("borrower"),
  validate({ params: idParamSchema }),
  rentalController.acceptAgreement,
);

router.patch(
  "/requests/:id/returned",
  auth,
  requireProfileComplete,
  requireRole("lender"),
  validate({ params: idParamSchema }),
  rentalController.markReturned,
);

router.post(
  "/requests/:id/rate",
  auth,
  requireProfileComplete,
  validate({ params: idParamSchema, body: submitRatingBodySchema }),
  rentalController.submitRating,
);

router.get(
  "/conversations/:conversationId",
  auth,
  requireProfileComplete,
  validate({ params: conversationIdParamSchema, query: messagesQuerySchema }),
  rentalController.getConversationHistory,
);

router.post(
  "/conversations/:conversationId",
  auth,
  requireProfileComplete,
  validate({ params: conversationIdParamSchema, body: sendMessageBodySchema }),
  rentalController.sendMessage,
);

router.patch(
  "/conversations/:conversationId/read",
  auth,
  requireProfileComplete,
  validate({ params: conversationIdParamSchema }),
  rentalController.markConversationRead,
);

export default router;
