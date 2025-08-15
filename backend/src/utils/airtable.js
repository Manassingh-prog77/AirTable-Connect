import axios from "axios";

const AUTH_BASE = "https://airtable.com/oauth2/v1";
const META_BASE = "https://api.airtable.com/v0/meta";
const REST_BASE = "https://api.airtable.com/v0";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function buildAuthorizeUrl({ clientId, redirectUri, scope, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state
  }).toString();
  return `${AUTH_BASE}/authorize?${params}`;
}


export async function exchangeCodeForToken({ code, code_verifier }) {
  // Hardcoded Airtable OAuth credentials
  const clientId = process.env.AIRTABLE_CLIENT_ID ;
  const clientSecret = process.env.AIRTABLE_CLIENT_SECRET;
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI;

  // Create Basic Auth header
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Prepare request body
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
    code_verifier
  });

  // Send request to Airtable
  const res = await axios.post(
    "https://airtable.com/oauth2/v1/token",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`
      }
    }
  );

  return res.data;
}


// Whoami (metadata)
export async function getWhoAmI(accessToken) {
  const { data } = await axios.get(`${META_BASE}/whoami`, {
    headers: authHeaders(accessToken)
  });
  return data;
}

// List bases
export async function listBases(accessToken) {
  const res = await axios.get(`${META_BASE}/bases`, {
    headers: authHeaders(accessToken)
  });
  return res.data; // { bases: [...], offset? }
}

// Get tables & fields for a base
export async function getBaseTables(accessToken, baseId) {
  const res = await axios.get(`${META_BASE}/bases/${baseId}/tables`, {
    headers: authHeaders(accessToken)
  });
  return res.data; // { tables: [...] }
}

// Create a record in a base/table (tableName or tableId)
export async function createRecord(accessToken, baseId, tableIdOrName, fieldsObj) {
  const url = `${REST_BASE}/${baseId}/${encodeURIComponent(tableIdOrName)}`;
  const res = await axios.post(url, { fields: fieldsObj }, {
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" }
  });
  return res.data;
}


export async function refreshAccessToken(refresh_token) {
  const url = "https://airtable.com/oauth2/v1/token";
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token
  });
  const creds = Buffer.from(`${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`).toString("base64");

  const { data } = await axios.post(url, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${creds}`
    }
  });

  return data;
}


// Helper: run an Airtable call; on invalid/expired token, refresh once and retry
export async function withAirtableAutoRefresh(userDoc, attemptFn, onTokenUpdated) {
  try {
    return await attemptFn(userDoc.tokens.access_token);
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    const shouldRefresh =
      status === 401 ||
      (status === 400 && (data?.error === "invalid_grant" || data?.error === "invalid_request"));

    if (!shouldRefresh) throw err;

    // Refresh
    const newTokens = await refreshAccessToken(userDoc.tokens.refresh_token);

    // persist tokens via callback (to DB)
    if (typeof onTokenUpdated === "function") {
      await onTokenUpdated(newTokens);
    }

    // retry once with new access token
    return await attemptFn(newTokens.access_token);
  }
}
