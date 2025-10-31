/**
 * Shim frontend: aucun secret ici.
 * Proxie l'appel vers le backend /api/ai (server/index.js).
 */

export async function askAI(promptOrMessages) {
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

  if (data?.error) {
    throw new Error(data.error?.message || 'AI API error');
  }

  const message = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;

  if (typeof message === 'string') {
    return message.trim();
  }

  return JSON.stringify(data);
}

/* Compatibilité avec l'ancien code */
export async function callOpenAI(payload) {
  return askAI(payload);
}

export async function chat(payload) {
  return askAI(payload);
}

/* Export par défaut pratique */
export default { callOpenAI, askAI, chat };
