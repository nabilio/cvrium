import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Clé stockée dans .env

app.post('/api/ai', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key missing',
        detail: 'Configure OPENAI_API_KEY in the server environment.'
      });
    }

    const { prompt, messages, options } = req.body || {};

    let resolvedMessages = Array.isArray(messages) ? messages : null;

    if (!resolvedMessages && typeof prompt === 'string') {
      let parsedMessages = null;
      try {
        const potentialMessages = JSON.parse(prompt);
        if (Array.isArray(potentialMessages)) {
          parsedMessages = potentialMessages;
        }
      } catch (error) {
        parsedMessages = null;
      }

      resolvedMessages = parsedMessages || [
        {
          role: 'user',
          content: prompt
        }
      ];
    } else if (!resolvedMessages) {
      resolvedMessages = [
        {
          role: 'user',
          content: ''
        }
      ];
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: resolvedMessages
    };

    if (options && typeof options === 'object') {
      if (options.response_format) {
        payload.response_format = options.response_format;
      }
      if (typeof options.temperature === 'number') {
        payload.temperature = options.temperature;
      }
      if (typeof options.max_tokens === 'number') {
        payload.max_tokens = options.max_tokens;
      }
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = r.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await r.json() : await r.text();

    if (!r.ok) {
      return res.status(r.status).json(
        isJson
          ? data
          : {
              error: 'OpenAI API error',
              detail: data
            }
      );
    }

    res.status(r.status).json(data);
  } catch (err) {
    console.error('Erreur API OpenAI:', err);
    res.status(500).json({
      error: 'Erreur API',
      detail: err?.message || String(err)
    });
  }
});

app.listen(PORT, () => console.log(`✅ CVRIUM API démarrée sur le port ${PORT}`));
