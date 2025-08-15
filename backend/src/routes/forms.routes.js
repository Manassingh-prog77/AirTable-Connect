import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import Form from "../models/Form.js";
import User from "../models/User.js";
import { createRecord } from "../utils/airtable.js";
import { isQuestionVisible, validateRequired } from "../utils/logic.js";
import { withAirtableAutoRefresh } from "../utils/airtable.js";

const router = Router();
router.use(requireAuth());

// create
router.post("/", async (req, res) => {
  const { title, baseId, tableId, tableName, questions } = req.body;
  const form = await Form.create({
    owner: req.user._id, title, baseId, tableId, tableName, questions
  });
  res.json(form);
});

// list
router.get("/", async (req, res) => {
  const forms = await Form.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(forms);
});

// get
router.get("/:id", async (req, res) => {
  const form = await Form.findOne({ _id: req.params.id, owner: req.user._id });
  if (!form) return res.status(404).json({ error: "Not found" });
  res.json(form);
});

// update
router.put("/:id", async (req, res) => {
  const form = await Form.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
  if (!form) return res.status(404).json({ error: "Not found" });
  res.json(form);
});

// delete
router.delete("/:id", async (req, res) => {
  await Form.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  res.json({ ok: true });
});

// submit -> create Airtable record
router.post("/:id/submit", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id });
    if (!form) return res.status(404).json({ error: "Form not found" });

    // Security: Only the owner can submit via this private route
    // (Public submissions would go via /api/public/... if you add it later)
    if (String(form.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const answers = req.body.answers || {}; // { fieldId: value }

    // 1) Enforce conditional visibility: drop answers for hidden questions
    const filteredAnswers = {};
    for (const q of form.questions) {
      const visible = isQuestionVisible(answers, q);
      if (!visible) continue;
      if (answers.hasOwnProperty(q.fieldId)) {
        filteredAnswers[q.fieldId] = answers[q.fieldId];
      }
    }

    // 2) Required validation among visible questions
    const missing = validateRequired(filteredAnswers, form.questions);
    if (missing.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        missing // [{ fieldId, label }]
      });
    }

    // 3) Map answers to Airtable fields
    const fieldsForAirtable = {};
    for (const q of form.questions) {
      const val = filteredAnswers[q.fieldId];
      if (val === undefined || val === null || val === "") continue;

      const targetName = q.fieldName; // Use original Airtable field name

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

    const tableForApi = (form.tableName && form.tableName.trim() !== "") ? form.tableName : form.tableId;

    // auto-refresh token if expired, then create record
    const userDoc = await User.findById(req.user._id);

    const airtableResult = await withAirtableAutoRefresh(
      userDoc,
      async (accessToken) => {
        return await createRecord(accessToken, form.baseId, tableForApi, fieldsForAirtable);
      },
      async (newTokens) => {
        // persist updated tokens
        userDoc.tokens.access_token = newTokens.access_token;
        if (newTokens.refresh_token) {
          userDoc.tokens.refresh_token = newTokens.refresh_token;
        }
        userDoc.tokens.token_type = newTokens.token_type || userDoc.tokens.token_type;
        userDoc.tokens.scope = newTokens.scope || userDoc.tokens.scope;
        await userDoc.save();
      }
    );

    return res.json({ ok: true, airtable: airtableResult });
  } catch (err) {
    console.error("submit error", err?.response?.data || err);
    res.status(500).json({ error: "Submit failed" });
  }
});

export default router;
