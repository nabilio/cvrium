import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY manquante. Définis-la côté serveur (variable d'environnement) " +
    "et ne l'expose jamais dans le front."
  );
}

export const openai = new OpenAI({ apiKey });
export default openai;
