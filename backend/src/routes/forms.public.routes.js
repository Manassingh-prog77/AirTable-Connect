import { Router } from "express";
import Form from "../models/Form.js";
import User from "../models/User.js";
import { createRecord } from "../utils/airtable.js";

const router = Router();

// Anyone can fetch a public form schema by publicId
router.get("/forms/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const form = await Form.findOne({ publicId, isPublic: true }).lean();
    if (!form) return res.status(404).json({ error: "Form not found or not public" });

    // Return only what's needed for rendering/filling
    const payload = {
      title: form.title,
      publicId: form.publicId,
      baseId: form.baseId,
      tableId: form.tableId,
      tableName: form.tableName || "",
      questions: form.questions.map(q => ({
        fieldId: q.fieldId,
        fieldName: q.fieldName,
        fieldType: q.fieldType,
        label: q.label || q.fieldName,
        required: !!q.required,
        visibleWhen: q.visibleWhen || { logic: "all", rules: [] }
      }))
    };

    res.json(payload);
  } catch (err) {
    console.error("public form fetch error", err);
    res.status(500).json({ error: "Failed to load form" });
  }
});


router.post("/forms/:publicId/submit", async (req, res) => {
  try {
    const { publicId } = req.params;
    const { answers } = req.body || {};

    // 1️⃣ Find the public form
    const form = await Form.findOne({ publicId, isPublic: true }).lean();
    if (!form) {
      return res.status(404).json({ error: "Form not found or not public" });
    }

    // 2️⃣ Find the form owner to get Airtable tokens
    const owner = await User.findById(form.owner).lean();
    if (!owner || !owner.tokens?.access_token) {
      return res.status(500).json({ error: "Form owner tokens not found" });
    }

    // 3️⃣ Prepare Airtable fields from answers
    const fieldsForAirtable = {};
    for (const q of form.questions) {
      const val = answers?.[q.fieldId];
      if (val === undefined || val === null || val === "") continue;

      const targetName = q.fieldName;

      switch (q.fieldType) {
        case "singleLineText":
        case "longText":
          fieldsForAirtable[targetName] = String(val);
          break;
        case "singleSelect":
          fieldsForAirtable[targetName] = { name: String(val) };
          break;
        case "multipleSelects":
          fieldsForAirtable[targetName] = (Array.isArray(val) ? val : [val]).map(v => ({ name: String(v) }));
          break;
        case "multipleAttachments":
          fieldsForAirtable[targetName] = (Array.isArray(val) ? val : [val]).map(url => ({ url: String(url) }));
          break;
        default:
          break;
      }
    }

    // 4️⃣ Determine table name for API
    const tableForApi = form.tableName?.trim() !== "" ? form.tableName : form.tableId;

    // 5️⃣ Submit record to Airtable using owner’s token
    const airtableRes = await createRecord(
      owner.tokens.access_token,
      form.baseId,
      tableForApi,
      fieldsForAirtable
    );

    res.json({ ok: true, airtable: airtableRes });
  } catch (err) {
    console.error("public submit error", err?.response?.data || err);
    res.status(500).json({ error: "Public submit failed" });
  }
});

export default router;
