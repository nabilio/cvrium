// src/lib/openai.js
// Ce fichier ne contient plus la clé API pour éviter toute fuite de données.
// Les appels à l’API OpenAI doivent être faits côté serveur uniquement (Node/Express).
// Pour l’instant, on désactive cette fonction côté client.

export const callOpenAI = async (prompt) => {
  console.warn("⚠️ L'appel direct à l'API OpenAI depuis le front est désactivé pour des raisons de sécurité.");
  console.warn("Utilisez le backend (server/openai.js) pour faire vos requêtes à l'API OpenAI.");
  return "Fonction désactivée côté client.";
};

