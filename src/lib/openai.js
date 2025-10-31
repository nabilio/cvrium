const DEFAULT_OPTIONS = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

function normalizeMessageContent(message) {
  if (message == null) {
    return '';
  }

  if (typeof message === 'string') {
    return message;
  }

  const content = message.content ?? message.text ?? message;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part == null) {
          return '';
        }

        if (typeof part === 'string') {
          return part;
        }

        if (typeof part === 'object') {
          if (typeof part.text === 'string') {
            return part.text;
          }

          if (typeof part.text?.value === 'string') {
            return part.text.value;
          }

          if (typeof part.content === 'string') {
            return part.content;
          }
        }

        return '';
      })
      .join('')
      .trim();
  }

  if (typeof content === 'object') {
    if (typeof content.text === 'string') {
      return content.text;
    }

    if (typeof content.text?.value === 'string') {
      return content.text.value;
    }

    if (typeof content.content === 'string') {
      return content.content;
    }
  }

  return '';
}

function buildRequestBody(input, overrides) {
  if (Array.isArray(input)) {
    return { messages: input, ...overrides };
  }

  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const body = { ...input };

    if (overrides && typeof overrides === 'object') {
      Object.assign(body, overrides);
    }

    if (!body.prompt && typeof body.messages === 'undefined') {
      body.prompt = '';
    }

    return body;
  }

  return { prompt: String(input ?? ''), ...overrides };
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI API error: ${res.status} ${text}`);
  }

  return res.json();
}

function extractTextFromResponse(data) {
  if (!data) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data?.choices) && data.choices.length > 0) {
    const choice = data.choices[0];
    const message = choice?.message ?? choice;
    const content = normalizeMessageContent(message);

    if (content) {
      return content;
    }
  }

  if (typeof data?.text === 'string') {
    return data.text;
  }

  return '';
}

export async function askAI(input, requestOverrides) {
  const body = buildRequestBody(input, requestOverrides);

  const res = await fetch('/api/ai', {
    ...DEFAULT_OPTIONS,
    body: JSON.stringify(body)
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const errorMessage =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.message || data?.message || `AI API error (${res.status})`;
    const detail = data?.detail || data?.error?.code || data?.code;
    throw new Error(detail ? `${errorMessage}: ${detail}` : errorMessage);
  }

  const text = extractTextFromResponse(data);

  if (text && typeof text === 'string') {
    return text.trim();
  }

  return JSON.stringify(data);
}

export async function callOpenAI(input, requestOverrides) {
  return askAI(input, requestOverrides);
}

export async function chat(input, requestOverrides) {
  return askAI(input, requestOverrides);
}

export default { callOpenAI, askAI, chat };
