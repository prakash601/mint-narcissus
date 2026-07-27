import { createLogger } from "../../shared/logger/index.js";
import { asyncHandler } from "../../shared/errors/asyncHandler.js";
import { ok, created } from "../../shared/http/response.js";
import * as itemService from "./item.service.js";

const log = createLogger("items");

export const getMyItems = asyncHandler(async (req, res) => {
  log.debug("listMyItems called", { meta: { lenderId: req.user.id } });
  const data = await itemService.listMyItems(req.user.id);
  log.debug("listMyItems result", { meta: { count: data.length } });
  return ok(res, { data });
});

export const getPublicFeed = asyncHandler(async (req, res) => {
  log.debug("getPublicFeed called", { meta: { query: req.query } });
  const result = await itemService.listPublicFeed(req.query);
  log.debug("getPublicFeed result", { meta: { total: result.total, page: result.page } });
  return ok(res, result);
});

export const createItem = asyncHandler(async (req, res) => {
  log.debug("createItem called", { meta: { lenderId: req.user.id, bodyKeys: Object.keys(req.body), fileCount: (req.files || []).length } });
  const item = await itemService.createItem(req.user.id, req.body, req.files || []);
  log.debug("createItem succeeded", { meta: { itemId: item.id } });
  return created(res, { data: item });
});

export const getItemById = asyncHandler(async (req, res) => {
  log.debug("getItemById called", { meta: { id: req.params.id } });
  const item = await itemService.getItemById(req.params.id);
  return ok(res, { data: item });
});

export const getSavedItems = asyncHandler(async (req, res) => {
  log.debug("getSavedItems called", { meta: { borrowerId: req.user.id } });
  const data = await itemService.listSavedItems(req.user.id);
  log.debug("getSavedItems result", { meta: { count: data.length } });
  return ok(res, { data });
});

export const saveItem = asyncHandler(async (req, res) => {
  log.debug("saveItem called", { meta: { borrowerId: req.user.id, itemId: req.params.id } });
  const saved = await itemService.saveItem(req.user.id, req.params.id);
  return created(res, { data: saved, message: "Item saved successfully" });
});

export const unsaveItem = asyncHandler(async (req, res) => {
  log.debug("unsaveItem called", { meta: { borrowerId: req.user.id, itemId: req.params.id } });
  const result = await itemService.unsaveItem(req.user.id, req.params.id);
  return ok(res, result);
});

export const deleteItem = asyncHandler(async (req, res) => {
  log.debug("deleteItem called", { meta: { lenderId: req.user.id, itemId: req.params.id } });
  const result = await itemService.deleteItem(req.user.id, req.params.id);
  return ok(res, result);
});

export const updateItemStatus = asyncHandler(async (req, res) => {
  log.debug("updateItemStatus called", { meta: { lenderId: req.user.id, itemId: req.params.id, status: req.body.status } });
  const item = await itemService.updateItemStatus(req.user.id, req.params.id, req.body.status);
  return ok(res, { data: item, message: "Item status updated successfully" });
});
