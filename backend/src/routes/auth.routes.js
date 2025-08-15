// src/routes/auth.routes.js
import { Router } from "express";
import crypto from "crypto";
import User from "../models/User.js";
import { buildAuthorizeUrl, exchangeCodeForToken, getWhoAmI } from "../utils/airtable.js";

const router = Router();

function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

// base64url helper
function base64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// generate a code_verifier (between 43 and 128 chars) and its code_challenge
function createPkcePair() {
  // generate 64 random bytes -> base64url length ~86
  const verifier = base64url(crypto.randomBytes(64));
  // sha256 and base64url encode
  const hash = crypto.createHash("sha256").update(verifier).digest();
  const challenge = base64url(hash);
  return { verifier, challenge };
}

router.get("/airtable/login", (req, res) => {
  // generate CSRF state and PKCE pair
  const state = generateState();
  const { verifier: code_verifier, challenge: code_challenge } = createPkcePair();

  // store both in session
  req.session.oauthState = state;
  req.session.codeVerifier = code_verifier;

  // build authorize URL with PKCE params
  const params = new URLSearchParams({
    client_id: process.env.AIRTABLE_CLIENT_ID,
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI || "http://localhost:4000/api/auth/airtable/callback",
    response_type: "code",
    scope: "schema.bases:read data.records:read data.records:write",
    state,
    code_challenge,
    code_challenge_method: "S256"
  }).toString();

  const url = `https://airtable.com/oauth2/v1/authorize?${params}`;
  console.log("Airtable authorize URL:", url);
  res.redirect(url);
});

router.get("/airtable/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.session?.oauthState;
    const code_verifier = req.session?.codeVerifier; // ⬅️ retrieve PKCE verifier

    if (!state || !savedState || state !== savedState) {
      console.warn("OAuth state mismatch", { received: state, saved: savedState });
      return res.status(400).send("Invalid OAuth state. Please retry login.");
    }
    if (!code) return res.status(400).send("Missing code");

    const tokens = await exchangeCodeForToken({
      clientId: process.env.AIRTABLE_CLIENT_ID,
      redirectUri: process.env.AIRTABLE_REDIRECT_URI || "http://localhost:4000/api/auth/airtable/callback",
      code,
      code_verifier
    });


    const me = await getWhoAmI(tokens.access_token);

    const airtableUserId = me?.id || me?.account_id || (me?.user && me.user.id) || String(Date.now());
    const email = me?.email || (me?.user && me.user.email) || "";
    const name = me?.name || (me?.user && me.user.name) || "";

    let user = await User.findOne({ airtableUserId });
    if (!user) user = new User({ airtableUserId, email, name });

    user.tokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: tokens.expires_at
    };
    await user.save();

    // cleanup single-use values
    req.session.oauthState = null;
    req.session.codeVerifier = null;
    req.session.uid = user._id.toString();

    return res.redirect(`${process.env.CLIENT_URL}?ok=1`);
  } catch (err) {
    console.error("oauth callback error", err?.response?.data || err);
    return res.status(500).send("OAuth callback failed");
  }
});


router.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

export default router;