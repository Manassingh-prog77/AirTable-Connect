import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { listBases, getBaseTables } from "../utils/airtable.js";

const router = Router();
router.use(requireAuth());

router.get("/bases", async (req, res) => {
  try {
    const data = await listBases(req.user.tokens.access_token);
    // return only necessary fields
    res.json({ bases: data?.bases || [] });
  } catch (err) {
    console.error("list bases error", err?.response?.data || err);
    res.status(500).json({ error: "Failed to list bases" });
  }
});

router.get("/tables", async (req, res) => {
  try {
    const baseId = req.query.baseId;
    if (!baseId) return res.status(400).json({ error: "baseId required" });
    const data = await getBaseTables(req.user.tokens.access_token, baseId);
    res.json({ tables: data?.tables || [] });
  } catch (err) {
    console.error("get tables error", err?.response?.data || err);
    res.status(500).json({ error: "Failed to get tables" });
  }
});

// fields filtered to allowed types
router.get("/fields", async (req, res) => {
  try {
    const { baseId, tableId } = req.query;
    if (!baseId || !tableId) return res.status(400).json({ error: "baseId & tableId required" });

    const data = await getBaseTables(req.user.tokens.access_token, baseId);
    const table = (data?.tables || []).find(t => t.id === tableId);
    if (!table) return res.status(404).json({ error: "Table not found" });

    const typeMap = {
      "singleLineText": "singleLineText",
      "singleLineTextField": "singleLineText",
      "multilineText": "longText",
      "longText": "longText",
      "singleSelect": "singleSelect",
      "singleSelectField": "singleSelect",
      "multipleSelects": "multipleSelects",
      "multipleSelectField": "multipleSelects",
      "multipleAttachments": "multipleAttachments",
      "attachment": "multipleAttachments"
    };

    const allowedTypes = new Set(Object.keys(typeMap));

    const fields = (table.fields || [])
      .filter(f => allowedTypes.has(f.type))
      .map(f => ({
        id: f.id,
        name: f.name,
        type: typeMap[f.type] || f.type,
        options: f.options || null
      }));

    res.json({ fields });
  } catch (err) {
    console.error("get fields error", err?.response?.data || err);
    res.status(500).json({ error: "Failed to get fields" });
  }
});


export default router;
