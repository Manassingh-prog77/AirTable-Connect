import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RuleSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },         // the question this rule refers to
    operator: {
      type: String,
      enum: [
        "equals",
        "notEquals",
        "includes",        // for multi-select
        "notIncludes",     // for multi-select
        "exists",
        "notExists"
      ],
      required: true
    },
    value: { type: mongoose.Schema.Types.Mixed }       // string | string[] | null
  },
  { _id: false }
);

const VisibleWhenSchema = new mongoose.Schema(
  {
    logic: { type: String, enum: ["all", "any"], default: "all" },
    rules: { type: [RuleSchema], default: [] }
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },         // Airtable field id
    fieldName: { type: String, required: true },       // Airtable field name (used for record creation)
    fieldType: {
      type: String,
      enum: [
        "singleLineText",
        "longText",
        "singleSelect",
        "multipleSelects",
        "multipleAttachments"
      ],
      required: true
    },
    label: { type: String, default: "" },              // custom label shown in UI
    required: { type: Boolean, default: false },
    visibleWhen: { type: VisibleWhenSchema, default: () => ({ logic: "all", rules: [] }) }
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Form" },
    baseId: { type: String, required: true },
    tableId: { type: String, required: true },
    tableName: { type: String, default: "" },

    questions: { type: [QuestionSchema], default: [] },

    // Public access
    isPublic: { type: Boolean, default: true },
    publicId: { type: String, default: uuidv4, index: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
