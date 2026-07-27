import { asyncHandler } from "../../shared/errors/asyncHandler.js";
import { ok, created } from "../../shared/http/response.js";
import * as rentalService from "./rental.service.js";

export const createRequest = asyncHandler(async (req, res) => {
  const request = await rentalService.createRequest(req.user.id, req.body.outfitId);
  return created(res, { data: request });
});

export const getIncomingRequests = asyncHandler(async (req, res) => {
  const result = await rentalService.listIncomingRequests(req.user.id, req.query);
  return ok(res, result);
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const result = await rentalService.listMyRequests(req.user.id, req.query);
  return ok(res, result);
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await rentalService.getRequestById(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const result = await rentalService.approveRequest(req.user.id, req.params.id);
  return ok(res, result);
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await rentalService.rejectRequest(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await rentalService.cancelRequest(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const confirmLend = asyncHandler(async (req, res) => {
  const request = await rentalService.confirmLend(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const acceptAgreement = asyncHandler(async (req, res) => {
  const request = await rentalService.acceptAgreement(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const markReturned = asyncHandler(async (req, res) => {
  const request = await rentalService.markReturned(req.user.id, req.params.id);
  return ok(res, { data: request });
});

export const submitRating = asyncHandler(async (req, res) => {
  const request = await rentalService.submitRating(req.user.id, req.params.id, req.body.rating);
  return ok(res, { data: request });
});

export const getConversations = asyncHandler(async (req, res) => {
  const data = await rentalService.listConversations(req.user.id);
  return ok(res, { data });
});

export const getConversationHistory = asyncHandler(async (req, res) => {
  const result = await rentalService.getConversationHistory(
    req.user.id,
    req.params.conversationId,
    req.query,
  );
  return ok(res, result);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await rentalService.sendMessage(
    req.user.id,
    req.params.conversationId,
    req.body.text,
    req.io || req.app.get("io"),
  );
  return created(res, { data: message });
});

export const markConversationRead = asyncHandler(async (req, res) => {
  const result = await rentalService.markConversationRead(
    req.user.id,
    req.params.conversationId,
  );
  return ok(res, result);
});
