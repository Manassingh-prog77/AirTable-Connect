import User from "../models/User.js";
import { refreshAccessToken } from "../utils/airtable.js";

export default function requireAuth() {
  return async (req, res, next) => {
    try {
      const uid = req.session?.uid;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const user = await User.findById(uid);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // refresh token if near expiry
      if (user.tokens?.expires_at) {
        const secsLeft = (new Date(user.tokens.expires_at).getTime() - Date.now()) / 1000;
        if (secsLeft <= 60 && user.tokens.refresh_token) {
          const refreshed = await refreshAccessToken({
            clientId: process.env.AIRTABLE_CLIENT_ID,
            clientSecret: process.env.AIRTABLE_CLIENT_SECRET,
            refresh_token: user.tokens.refresh_token
          });
          user.tokens = { ...user.tokens, ...refreshed };
          await user.save();
        }
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("requireAuth error", err?.response?.data || err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
