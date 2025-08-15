import { Router } from "express";
import PDFDocument from "pdfkit";
import requireAuth from "../middleware/requireAuth.js";
import Form from "../models/Form.js";
import { isQuestionVisible } from "../utils/logic.js";

const router = Router();
router.use(requireAuth());

function streamFormPdf(res, form, answers) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${(form.title || "Form").replace(/[^a-z0-9._-]/gi, "_")}.pdf"`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text(form.title || "Form", { underline: true });
  doc.moveDown();

  // Metadata
  doc.fontSize(10).fillColor("gray").text(`Base: ${form.baseId}   Table: ${form.tableName || form.tableId}`);
  doc.moveDown(0.5);
  doc.fillColor("black");

  // Content
  form.questions.forEach((q, idx) => {
    const visible = !answers ? true : isQuestionVisible(answers, q);
    if (!visible) return;

    const label = q.label || q.fieldName;
    doc.fontSize(12).text(`${idx + 1}. ${label}${q.required ? " *" : ""}`);

    if (answers) {
      const ans = answers[q.fieldId];
      let valText = "";
      if (ans === undefined || ans === null || ans === "") {
        valText = "-";
      } else if (Array.isArray(ans)) {
        valText = ans.join(", ");
      } else {
        valText = String(ans);
      }
      doc.fontSize(11).fillColor("gray").text(`Answer: ${valText}`);
      doc.fillColor("black");
    } else {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("gray").text(`[${q.fieldType}]`);
      doc.fillColor("black");
    }

    doc.moveDown();
    doc.moveDown(0.2);
  });

  doc.end();
}

// Blank form (schema only)
router.get("/forms/:id/export/pdf", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!form) return res.status(404).json({ error: "Not found" });

    streamFormPdf(res, form, null);
  } catch (err) {
    console.error("export pdf error", err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
});

// Filled answers form
router.post("/forms/:id/export/pdf", async (req, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!form) return res.status(404).json({ error: "Not found" });

    const { answers } = req.body || {};
    streamFormPdf(res, form, answers || {});
  } catch (err) {
    console.error("export pdf (filled) error", err);
    res.status(500).json({ error: "Failed to export PDF" });
  }
});

export default router;
