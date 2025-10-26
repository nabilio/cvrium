import OpenAI from 'openai';
import { env } from '../config/env';
import { z } from 'zod';

const resumeSchema = z.object({
  summary: z.string(),
  experiences: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        bullets: z.array(z.string()),
        technologies: z.array(z.string()),
      }),
    )
    .default([]),
  education: z
    .array(z.object({ school: z.string(), degree: z.string(), startDate: z.string(), endDate: z.string() }))
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        bullets: z.array(z.string()),
        technologies: z.array(z.string()),
      }),
    )
    .default([]),
  certs: z.array(z.string()).default([]),
  languages: z.array(z.object({ name: z.string(), level: z.string() })).default([]),
  interests: z.array(z.string()).default([]),
});

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

async function callAi(messages: Array<{ role: 'system' | 'user'; content: string }>) {
  const response = await openai.chat.completions.create({
    model: env.AI_MODEL,
    temperature: env.AI_TEMPERATURE,
    messages,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty AI response');
  }
  return content;
}

export async function generatePrefill(params: {
  text: string;
  language: 'fr' | 'en';
  seniority: 'junior' | 'intermediate' | 'senior';
  targetRole: string;
  industry?: string;
}) {
  const system = `Tu es un assistant expert en rédaction de CV ATS-friendly.\nObjectif : transformer une description libre en un CV structuré JSON strict, prêt à être directement inséré dans la base.\nExigences:\n- Style concis, impact, verbes d’action, métriques chiffrées si disponibles.\n- Pas de tableaux ni colonnes; phrases actives; pas d’icônes.\n- Langue: ${params.language}; Seniority: ${params.seniority}; Rôle cible: ${params.targetRole}.\n- Respecte strictement le schéma JSON ci-dessous.\nSchéma:\n{\n  "summary": "string",\n  "experiences": [\n    {\n      "title": "string",\n      "company": "string",\n      "location": "string",\n      "startDate": "YYYY-MM",\n      "endDate": "YYYY-MM|null",\n      "bullets": ["string", "..."],\n      "technologies": ["string", "..."]\n    }\n  ],\n  "education": [\n    { "school": "string", "degree": "string", "startDate": "YYYY", "endDate": "YYYY" }\n  ],\n  "skills": ["string", "..."],\n  "projects": [\n    { "name": "string", "description": "string", "bullets": ["string", "..."], "technologies": ["string"] }\n  ],\n  "certs": ["string"],\n  "languages": [{"name":"string","level":"string"}],\n  "interests": ["string"]\n}\nRetourne uniquement le JSON valide.`;

  const user = `Texte libre:\n---\n${params.text}\n---\nContexte:\n- Langue: ${params.language}\n- Seniority: ${params.seniority}\n- Rôle cible: ${params.targetRole}\n- Secteur cible: ${params.industry ?? 'non renseigné'}`;

  const raw = await callAi([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);

  const parsed = resumeSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid AI JSON: ${parsed.error.message}`);
  }

  return parsed.data;
}

export async function generatePrefillSection(params: {
  resumeSnippet: unknown;
  sectionType: string;
  targetPath: string;
  mode: 'append' | 'replace';
  prompt: string;
  language: string;
}) {
  const system = `Tu écris du contenu de CV ATS-friendly ciblé pour une section précise.\nRenvoie du JSON minimal correspondant à targetPath. \nModes:\n- append: ajoute des éléments au contenu existant\n- replace: remplace strictement le contenu ciblé\nRespecte le format attendu par la zone ciblée (ex: liste de puces).`;
  const user = `Contexte CV (extrait utile JSON): \n${JSON.stringify(params.resumeSnippet)}\n\nCible:\n- sectionType: ${params.sectionType}\n- targetPath: ${params.targetPath}\n- mode: ${params.mode}\n\nInstructions:\n${params.prompt}\nContraintes ATS: verbes d’action, résultats chiffrés, phrases actives.\nLangue: ${params.language}`;
  return JSON.parse(
    await callAi([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]),
  );
}

export async function optimizeByJD(params: { resume: unknown; jobDescription: string; language: string }) {
  const system =
    'Tu optimises un CV existant pour correspondre à une offre. Retourne uniquement le JSON du CV ajusté.';
  const user = `CV actuel: ${JSON.stringify(params.resume)}\n\nOffre: ${params.jobDescription}\nLangue: ${params.language}`;
  return JSON.parse(
    await callAi([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]),
  );
}

export async function coverLetter(params: { resume: unknown; jobDescription: string; language: string }) {
  const system =
    'Tu rédiges une lettre de motivation concise, personnalisée, en 5 paragraphes maximum. Retourne du texte brut.';
  const user = `CV: ${JSON.stringify(params.resume)}\n\nOffre: ${params.jobDescription}\nLangue: ${params.language}`;
  const response = await callAi([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);
  return response;
}

export async function atsCheck(params: { resume: unknown; jobDescription?: string }) {
  const system =
    'Tu es un analyseur ATS. Retourne du JSON avec score (0-100) et flags (liste de messages concis).';
  const user = `CV: ${JSON.stringify(params.resume)}\n\nOffre: ${params.jobDescription ?? 'non fournie'}`;
  return JSON.parse(
    await callAi([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]),
  );
}
