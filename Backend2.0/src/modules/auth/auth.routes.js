import express from "express";
import passport from "passport";
import { auth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { authRateLimiter } from "../../middleware/security.js";
import { env } from "../../config/env.js";
import {
  register,
  login,
  logout,
  linkedinCallback,
  getMe,
  updateMe,
} from "./auth.controller.js";
import {
  registerBodySchema,
  loginBodySchema,
  updateMeBodySchema,
} from "./auth.validators.js";

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validate({ body: registerBodySchema }),
  register,
);
router.post("/login", authRateLimiter, validate({ body: loginBodySchema }), login);
router.post("/logout", logout);
router.get("/me", auth, getMe);
router.patch("/me", auth, validate({ body: updateMeBodySchema }), updateMe);

router.get("/linkedin", (req, res, next) => {
  const mode = req.query.mode || "login";
  res.cookie("linkedin_auth_mode", mode, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    sameSite: "lax",
    secure: env.isProduction,
  });
  passport.authenticate("linkedin")(req, res, next);
});

router.get(
  "/linkedin/callback",
  (req, res, next) => {
    const mode = req.cookies?.linkedin_auth_mode || "login";
    const fallbackPath = mode === "signup" ? "/register" : "/login";

    res.clearCookie("linkedin_auth_mode");

    passport.authenticate("linkedin", { session: false }, (err, user) => {
      if (err || !user) {
        const errorType =
          err?.code === "user_cancelled_login" || err?.code === "user_cancelled_authorize"
            ? "linkedin_cancelled"
            : "linkedin_failed";
        return res.redirect(`${env.clientUrl}${fallbackPath}?error=${errorType}`);
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  linkedinCallback,
);

export default router;
