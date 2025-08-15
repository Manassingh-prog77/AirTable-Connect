// Evaluate if a question should be visible given current answers.
// visibleWhen: { logic: 'all'|'any', rules: [{ fieldId, operator, value }] }
export function isQuestionVisible(answers, question) {
  const vw = question.visibleWhen || { logic: "all", rules: [] };
  if (!vw.rules || vw.rules.length === 0) return true;

  const evalRule = (rule) => {
    const { fieldId, operator, value } = rule;
    const ans = answers?.[fieldId];

    switch (operator) {
      case "exists":
        return ans !== undefined && ans !== null && ans !== "";
      case "notExists":
        return ans === undefined || ans === null || ans === "";

      case "equals":
        return String(ans) === String(value);
      case "notEquals":
        return String(ans) !== String(value);

      case "includes": {
        const arr = Array.isArray(ans) ? ans : [ans].filter(Boolean);
        if (Array.isArray(value)) {
          return value.some(v => arr.map(String).includes(String(v)));
        }
        return arr.map(String).includes(String(value));
      }

      case "notIncludes": {
        const arr = Array.isArray(ans) ? ans : [ans].filter(Boolean);
        if (Array.isArray(value)) {
          return !value.some(v => arr.map(String).includes(String(v)));
        }
        return !arr.map(String).includes(String(value));
      }

      default:
        return true;
    }
  };

  const results = vw.rules.map(evalRule);
  return vw.logic === "any" ? results.some(Boolean) : results.every(Boolean);
}

// Optional: check required fields among only the visible questions
export function validateRequired(answers, questions) {
  const missing = [];
  for (const q of questions) {
    const visible = isQuestionVisible(answers, q);
    if (!visible) continue;
    if (q.required) {
      const val = answers?.[q.fieldId];
      const emptyArray = Array.isArray(val) && val.length === 0;
      if (val === undefined || val === null || val === "" || emptyArray) {
        missing.push({ fieldId: q.fieldId, label: q.label || q.fieldName });
      }
    }
  }
  return missing;
}
