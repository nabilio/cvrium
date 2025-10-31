export const parseAIJson = (raw) => {
  if (!raw) {
    throw new Error("EMPTY_RESPONSE");
  }

  const cleaned = raw
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      const possibleJson = cleaned.slice(start, end + 1);
      try {
        return JSON.parse(possibleJson);
      } catch (innerError) {
        console.error(
          "Impossible de parser la réponse IA (extraction).",
          innerError,
          cleaned,
        );
      }
    }

    console.error("Impossible de parser la réponse IA.", error, cleaned);
    throw new Error("AI_JSON_PARSE_ERROR");
  }
};

export default parseAIJson;
