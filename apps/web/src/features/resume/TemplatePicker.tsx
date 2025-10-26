import { useTranslation } from 'react-i18next';

const templates = [
  { key: 'chrono-pro', label: 'Chrono Pro' },
  { key: 'tech-minimal', label: 'Tech Minimal' },
  { key: 'elegant-ats', label: 'Elegant ATS' },
  { key: 'clean-modern', label: 'Clean Modern' },
  { key: 'compact-impact', label: 'Compact Impact' },
];

interface TemplatePickerProps {
  currentTemplate: string;
  onChange: (template: string) => void;
}

export function TemplatePicker({ currentTemplate, onChange }: TemplatePickerProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <legend className="text-sm font-semibold text-slate-900">{t('resumeEditor.templates')}</legend>
      <div className="space-y-2">
        <label htmlFor="template" className="sr-only">
          {t('resumeEditor.templates')}
        </label>
        <select
          id="template"
          value={currentTemplate}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {templates.map((template) => (
            <option key={template.key} value={template.key}>
              {template.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 text-xs text-slate-500">
        <p>{t('resumeEditor.templatesHint')}</p>
      </div>
    </fieldset>
  );
}
