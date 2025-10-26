import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface TemplateItem {
  id: string;
  key: string;
  name: string;
}

interface AiLogItem {
  id: string;
  type: string;
  status: string;
  tokensUsed: number;
  createdAt: string;
}

export function AdminPage(): JSX.Element {
  const { t } = useTranslation();
  const { data: templates } = useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: async () => {
      const response = await axios.get<TemplateItem[]>('/admin/templates', { withCredentials: true });
      return response.data;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: async () => {
      const response = await axios.get<AiLogItem[]>('/admin/logs/ai', { withCredentials: true });
      return response.data;
    },
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{t('admin.title')}</h1>
        <p className="text-sm text-slate-600">{t('admin.subtitle')}</p>
      </header>
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t('admin.templates')}</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {templates?.map((template) => (
            <li key={template.id} className="flex items-center justify-between">
              <span>{template.name}</span>
              <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{template.key}</code>
            </li>
          )) ?? <li>{t('admin.noTemplates')}</li>}
        </ul>
      </article>
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t('admin.aiLogs')}</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {logs?.map((log) => (
            <li key={log.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{log.type}</span>
                <span className="text-xs uppercase text-slate-500">{log.status}</span>
              </div>
              <p className="text-xs text-slate-500">
                {t('admin.logMeta', {
                  tokens: log.tokensUsed,
                  date: new Date(log.createdAt).toLocaleString(),
                })}
              </p>
            </li>
          )) ?? <li>{t('admin.noLogs')}</li>}
        </ul>
      </article>
    </section>
  );
}
