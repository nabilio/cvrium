/**
 * Shim frontend: aucun secret ici.
 * Proxie l'appel vers le backend /api/ai (server/index.js).
 */

export async function askAI(promptOrMessages, { rawResponse = false } = {}) {
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
  if (rawResponse) {
    return data;
  }

  const messageContent = data?.choices?.[0]?.message?.content;
  if (typeof messageContent !== 'string' || !messageContent.trim()) {
    throw new Error('Réponse vide de la part de l\'IA');
  }

  return messageContent.trim();
}

/* Compatibilité avec l'ancien code */
export async function callOpenAI(payload, options) {
  if (options && typeof options === 'object') {
    return askAI(payload, options);
  }

  return askAI(payload);
}

export async function chat(payload, options) {
  return callOpenAI(payload, options);
}

/* Export par défaut pratique */
export default { callOpenAI, askAI, chat };
