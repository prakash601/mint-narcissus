import { env } from "../../config/env.js";
import { asyncHandler } from "../../shared/errors/asyncHandler.js";
import { ok, created } from "../../shared/http/response.js";
import * as authService from "./auth.service.js";

const COOKIE_OPTIONS = authService.getAuthCookieOptions();

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.cookie("token", result.token, COOKIE_OPTIONS);
  return created(res, { user: result.user });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.cookie("token", result.token, COOKIE_OPTIONS);
  return ok(res, { user: result.user });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
  });
  return ok(res, { message: "Logged out successfully" });
});

export const linkedinCallback = (req, res) => {
  const token = authService.issueLinkedInToken(req.user);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.redirect(`${env.clientUrl}/`);
};

export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id);
  return ok(res, result);
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = await authService.updateCurrentUser(req.user.id, req.body);
  return ok(res, result);
});
