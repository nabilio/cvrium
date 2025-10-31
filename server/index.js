import 'dotenv/config';
import express from 'express';
import { OpenAI } from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const openaiClient = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
      organization: process.env.OPENAI_ORGANIZATION || process.env.OPENAI_ORG || undefined,
      project: process.env.OPENAI_PROJECT || undefined
    })
  : null;

const DEFAULT_SYSTEM_PROMPT =
  process.env.OPENAI_SYSTEM_PROMPT ||
  "Tu es l'assistant IA de CVRIUM. Aide l'utilisateur à améliorer son CV en français, sois clair et concis.";

function coerceString(value) {
  if (value == null) {
    return '';
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

function normalizeContent(message) {
  if (!message) {
    return '';
  }

  const content = message.content ?? message;

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

function toChatMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'object') {
    return null;
  }

  const role = rawMessage.role === 'system' ? 'system' : rawMessage.role === 'assistant' ? 'assistant' : 'user';
  const content = coerceString(rawMessage.content ?? '');

  return { role, content };
}

function buildMessages(body) {
  const messages = [];

  if (typeof body?.system === 'string' && body.system.trim()) {
    messages.push({ role: 'system', content: body.system.trim() });
  }

  if (typeof body?.options?.system === 'string' && body.options.system.trim()) {
    messages.push({ role: 'system', content: body.options.system.trim() });
  }

  if (Array.isArray(body?.messages) && body.messages.length > 0) {
    for (const rawMessage of body.messages) {
      const message = toChatMessage(rawMessage);
      if (message) {
        messages.push(message);
      }
    }
  } else if (typeof body?.prompt === 'string' && body.prompt.trim()) {
    const rawPrompt = body.prompt.trim();
    let parsedMessages = null;

    if (rawPrompt.startsWith('[')) {
      try {
        const candidate = JSON.parse(rawPrompt);
        if (Array.isArray(candidate)) {
          parsedMessages = candidate
            .map((item) => toChatMessage(item))
            .filter((message) => message);
        }
      } catch (error) {
        parsedMessages = null;
      }
    }

    if (parsedMessages && parsedMessages.length > 0) {
      messages.push(...parsedMessages);
    } else {
      messages.push({ role: 'user', content: rawPrompt });
    }
  } else {
    messages.push({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
    messages.push({ role: 'user', content: "L'utilisateur n'a pas fourni de contenu." });
  }

  if (!messages.some((message) => message.role === 'system')) {
    messages.unshift({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
  }

  return messages;
}

async function callOpenAIWithRetry(request) {
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await openaiClient.chat.completions.create(request);
    } catch (error) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;

      if (status && status >= 500 && attempt < maxAttempts) {
        const delay = 250 * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

app.post('/api/ai', async (req, res) => {
  if (!openaiClient) {
    return res.status(500).json({
      error: 'OpenAI API key missing',
      detail: 'Configure OPENAI_API_KEY dans votre environnement serveur.'
    });
  }

  try {
    const { model, options = {}, ...rest } = req.body ?? {};

    const messages = buildMessages({ ...rest, options });

    const temperature = typeof options.temperature === 'number' ? options.temperature : undefined;
    const maxTokens = typeof options.max_tokens === 'number' ? options.max_tokens : undefined;
    const topP = typeof options.top_p === 'number' ? options.top_p : undefined;
    const responseFormat = options.response_format && typeof options.response_format === 'object'
      ? options.response_format
      : undefined;

    const request = {
      model: typeof model === 'string' && model.trim() ? model.trim() : OPENAI_MODEL,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      response_format: responseFormat
    };

    const completion = await callOpenAIWithRetry(request);

    const choices = (completion.choices || []).map((choice) => {
      const content = normalizeContent(choice?.message);

      return {
        index: choice?.index ?? 0,
        finish_reason: choice?.finish_reason ?? null,
        message: {
          role: choice?.message?.role ?? 'assistant',
          content
        },
        text: content
      };
    });

    const payload = {
      id: completion.id,
      object: completion.object,
      created: completion.created,
      model: completion.model,
      usage: completion.usage,
      choices,
      text: choices?.[0]?.text ?? ''
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erreur API OpenAI:', error);

    const status = error?.status || error?.response?.status || 502;
    const data = error?.response?.data ?? error?.error ?? {};
    const detailMessage =
      typeof data === 'string'
        ? data
        : data?.message || data?.error || error?.message || 'Erreur inconnue';

    res.status(status).json({
      error: 'Erreur API OpenAI',
      detail: detailMessage,
      status,
      type: error?.type || error?.name,
      code: error?.code || data?.code || null
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ CVRIUM API démarrée sur le port ${PORT}`);
});
