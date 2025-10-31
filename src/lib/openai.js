/**
 * Shim frontend: aucun secret ici.
 * Proxie l'appel vers le backend /api/ai (server/index.js).
 */

export async function askAI(promptOrMessages) {
  let body;

  if (Array.isArray(promptOrMessages)) {
    body = { messages: promptOrMessages };
  } else if (
    promptOrMessages &&
    typeof promptOrMessages === 'object' &&
    (Array.isArray(promptOrMessages.messages) || typeof promptOrMessages.prompt === 'string')
  ) {
    body = { ...promptOrMessages };
  } else {
    body = { prompt: String(promptOrMessages ?? '') };
  }

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const contentType = res.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API error: ${res.status} ${text}`);
  }

  if (!res.ok) {
    const errorMessage =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.message || data?.message || `AI API error (${res.status})`;
    const detail = data?.detail || data?.error?.code;
    throw new Error(detail ? `${errorMessage}: ${detail}` : errorMessage);
  }

  const choice = data?.choices?.[0];
  let message = choice?.message?.content ?? choice?.text ?? data?.message;

  if (Array.isArray(message)) {
    message = message
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part?.type === 'text') {
          if (typeof part?.text === 'string') {
            return part.text;
          }
          if (typeof part?.text?.value === 'string') {
            return part.text.value;
          }
        }

        if (typeof part?.text === 'string') {
          return part.text;
        }

        if (typeof part?.content === 'string') {
          return part.content;
        }

        return '';
      })
      .join('');
  } else if (message && typeof message === 'object') {
    const textValue = message?.text?.value ?? message?.text;
    if (typeof textValue === 'string') {
      message = textValue;
    }
  }

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (typeof data === 'string') {
    return data;
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
