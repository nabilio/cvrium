import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Clé stockée dans .env

app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${OPENAI_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error('Erreur API OpenAI:', err);
    res.status(500).json({ error: 'Erreur API', detail: String(err) });
  }
});

app.listen(PORT, () => console.log(\`✅ CVRIUM API démarrée sur le port \${PORT}\`));
