import puppeteer from 'puppeteer';

type ResumeForPdf = {
  title: string;
  templateKey: string;
  sections: Array<{
    type: string;
    content: Record<string, unknown>;
  }>;
};

export async function createPDFBuffer(resume: ResumeForPdf): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const html = renderResumeHtml(resume);
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return buffer;
}

function renderResumeHtml(resume: ResumeForPdf): string {
  const sections = resume.sections
    .map(
      (section) => `
      <section>
        <h2>${section.type.toUpperCase()}</h2>
        <pre>${escapeHtml(JSON.stringify(section.content, null, 2))}</pre>
      </section>
    `,
    )
    .join('');

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${resume.title}</title>
    <style>
      body { font-family: 'Inter', system-ui; color: #0f172a; padding: 2rem; }
      h1 { font-size: 32px; margin-bottom: 0.5rem; }
      h2 { font-size: 18px; margin-top: 1.5rem; color: #0369a1; }
      section { page-break-inside: avoid; }
      pre { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; }
    </style>
  </head>
  <body data-template="${resume.templateKey}">
    <h1>${resume.title}</h1>
    ${sections}
  </body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
