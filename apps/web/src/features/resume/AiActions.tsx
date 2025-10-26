import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pushToast } from '@/components/Toaster';

interface AiActionsProps {
  resumeId: string;
}

export function AiActions({ resumeId }: AiActionsProps): JSX.Element {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handlePrefill = async () => {
    try {
      setLoading(true);
      await axios.post(
        '/ai/prefill',
        { resumeId, text: prompt, language: 'fr', seniority: 'intermediate', targetRole: 'Software Engineer' },
        { withCredentials: true },
      );
      pushToast(t('ai.prefillSuccess'));
    } catch (error) {
      pushToast(t('ai.prefillError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{t('ai.title')}</h2>
        <p className="text-sm text-slate-600">{t('ai.subtitle')}</p>
      </header>
      <div className="space-y-2">
        <label htmlFor="aiPrompt" className="block text-sm font-medium text-slate-700">
          {t('ai.promptLabel')}
        </label>
        <textarea
          id="aiPrompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        type="button"
        onClick={handlePrefill}
        disabled={loading}
        className="w-full rounded-md bg-secondary-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-secondary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 disabled:opacity-50"
      >
        {loading ? t('ai.loading') : t('ai.prefillCta')}
      </button>
    </section>
  );
}
