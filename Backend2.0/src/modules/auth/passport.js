import passport from "passport";
import OAuth2Strategy from "passport-oauth2";
import https from "node:https";
import { eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users } from "./auth.schema.js";
import { env } from "../../config/env.js";

function fetchLinkedInUserInfo(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.linkedin.com",
      path: "/v2/userinfo",
      family: 4,
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    https
      .get(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`LinkedIn userinfo failed: ${res.statusCode}`));
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

passport.use(
  "linkedin",
  new OAuth2Strategy(
    {
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
      clientID: env.linkedinClientId,
      clientSecret: env.linkedinClientSecret,
      callbackURL: env.linkedinCallbackUrl,
      scope: ["openid", "profile", "email"],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const info = await fetchLinkedInUserInfo(accessToken);

        const linkedinId = info.sub;
        const email = info.email || null;
        const name =
          info.name ||
          `${info.given_name || ""} ${info.family_name || ""}`.trim() ||
          "LinkedIn User";
        const profilePhoto = info.picture || null;

        if (!linkedinId) {
          return done(new Error("LinkedIn did not return a user id"));
        }

        let [user] = await db.select().from(users).where(eq(users.linkedinId, linkedinId));

        if (!user && email) {
          [user] = await db.select().from(users).where(eq(users.email, email));

          if (user) {
            const [updated] = await db
              .update(users)
              .set({
                linkedinId,
                profilePhoto: user.profilePhoto || profilePhoto,
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id))
              .returning();
            user = updated;
          }
        }

        if (!user) {
          if (!email) {
            return done(new Error("LinkedIn account has no email; cannot create user"));
          }

          const [created] = await db
            .insert(users)
            .values({
              name,
              email,
              linkedinId,
              profilePhoto,
            })
            .returning();
          user = created;
        }

        if (user.isRestricted) {
          return done(new Error("Account restricted"));
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
