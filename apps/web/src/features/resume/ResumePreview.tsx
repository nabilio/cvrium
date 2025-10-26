import { useMemo } from 'react';

interface ResumePreviewProps {
  resume: {
    title: string;
    templateKey: string;
    sections: Array<{
      id: string;
      type: string;
      content: Record<string, unknown>;
    }>;
  };
}

const sectionLabels: Record<string, string> = {
  summary: 'Résumé',
  experience: 'Expérience',
  education: 'Formation',
  skills: 'Compétences',
  projects: 'Projets',
  certs: 'Certifications',
  languages: 'Langues',
  interests: 'Centres d’intérêt',
  refs: 'Références',
};

export function ResumePreview({ resume }: ResumePreviewProps): JSX.Element {
  const grouped = useMemo(() => {
    return resume.sections.map((section) => ({
      ...section,
      label: sectionLabels[section.type] ?? section.type,
    }));
  }, [resume.sections]);

  return (
    <article
      role="presentation"
      className="resume-preview rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      data-theme={resume.templateKey}
    >
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">{resume.title}</h1>
      </header>
      <div className="mt-4 space-y-6">
        {grouped.map((section) => (
          <section key={section.id} aria-label={section.label} className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">{section.label}</h2>
            <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700">
              {JSON.stringify(section.content, null, 2)}
            </pre>
          </section>
        ))}
      </div>
    </article>
  );
}
