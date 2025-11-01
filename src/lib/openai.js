// Stub côté front pour satisfaire les imports sans exposer de clé.
// À remplacer plus tard par un appel à TON backend (/api/ai, Supabase Edge, etc.).

export async function callOpenAI(/* payload */) {
  // Option 1 : lever une erreur claire (conseillé pour éviter tout usage silencieux)
  const err = new Error("AI backend non configuré. Ajoute un endpoint serveur (/api/ai) qui lit OPENAI_API_KEY côté serveur.");
  err.code = "AI_BACKEND_MISSING";
  throw err;

  // Option 2 (alternative) : retourner une valeur vide au lieu d'erreur
  // return { text: "", error: "AI_BACKEND_MISSING" };
}

export default { callOpenAI };
