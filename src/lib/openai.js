/**
 * Shim côté frontend — pas de clé ici.
 * Redirige vers le backend local /api/ai (géré par server/index.js)
 */

export async function askAI(promptOrMessages) {
  // Compat: accepte string ou tableau de messages
  const prompt = Array.isArray(promptOrMessages)
    ? JSON.stringify(promptOrMessages)
    : String(promptOrMessages || '');

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

// Exporte aussi un nom "chat" pour compat avec d'anciens imports éventuels
export async function chat(promptOrMessages) {
  return askAI(promptOrMessages);
}

export default { askAI, chat };
