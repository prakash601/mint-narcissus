import { env } from "../../config/env.js";
import { asyncHandler } from "../../shared/errors/asyncHandler.js";
import { ok, created } from "../../shared/http/response.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.cookie("token", result.token, authService.getAuthCookieOptions());
  return created(res, { user: result.user });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.cookie("token", result.token, authService.getAuthCookieOptions());
  return ok(res, { user: result.user });
});

export const logout = asyncHandler(async (req, res) => {
  const opts = authService.getAuthCookieOptions();
  res.clearCookie("token", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: "/",
  });
  return ok(res, { message: "Logged out successfully" });
});

export const linkedinCallback = (req, res) => {
  const token = authService.issueLinkedInToken(req.user);
  res.cookie("token", token, authService.getAuthCookieOptions());
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
