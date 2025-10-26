import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { pushToast } from '@/components/Toaster';

interface ResumeListItem {
  id: string;
  title: string;
  templateKey: string;
  language: string;
  updatedAt: string;
}

export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await axios.get<ResumeListItem[]>('/resumes', { withCredentials: true });
      return response.data;
    },
  });

  const createResume = async () => {
    try {
      const response = await axios.post<ResumeListItem>(
        '/resumes',
        { title: t('dashboard.newResumeTitle'), templateKey: 'tech-minimal', language: 'fr' },
        { withCredentials: true },
      );
      pushToast(t('dashboard.resumeCreated'));
      window.location.href = `/resume/${response.data.id}`;
    } catch (error) {
      pushToast(t('dashboard.resumeCreateError'));
      console.error(error);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-slate-600">{t('dashboard.subtitle')}</p>
        <button
          type="button"
          onClick={createResume}
          className="self-start rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          {t('dashboard.createResume')}
        </button>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((resume) => (
          <li key={resume.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900">{resume.title}</h2>
              <p className="text-xs text-slate-500">
                {t('dashboard.templateLabel', { template: resume.templateKey })}
              </p>
              <p className="text-xs text-slate-500">
                {t('dashboard.lastUpdated', { date: new Date(resume.updatedAt).toLocaleString() })}
              </p>
              <Link
                to={`/resume/${resume.id}`}
                className="mt-2 inline-flex items-center justify-center rounded-md border border-primary-600 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {t('dashboard.editResume')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
