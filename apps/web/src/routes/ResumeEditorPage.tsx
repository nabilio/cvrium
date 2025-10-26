import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import Sortable from 'sortablejs';
import { useEffect, useRef } from 'react';
import { pushToast } from '@/components/Toaster';
import { useResumeStore } from '@/features/resume/store';
import { ResumePreview } from '@/features/resume/ResumePreview';
import { TemplatePicker } from '@/features/resume/TemplatePicker';
import { AiActions } from '@/features/resume/AiActions';

interface ResumeSection {
  id: string;
  type: string;
  orderIndex: number;
  content: Record<string, unknown>;
}

interface ResumeResponse {
  id: string;
  title: string;
  templateKey: string;
  sections: ResumeSection[];
  isPublic: boolean;
  publicSlug: string | null;
  atsScore: number | null;
}

export function ResumeEditorPage(): JSX.Element {
  const { resumeId } = useParams({ from: '/resume/$resumeId' });
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setSections, sections } = useResumeStore();
  const sortableRef = useRef<HTMLUListElement | null>(null);

  const { data } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const response = await axios.get<ResumeResponse>(`/resumes/${resumeId}`, {
        withCredentials: true,
      });
      setSections(response.data.sections);
      return response.data;
    },
  });

  useEffect(() => {
    if (!sortableRef.current) return;

    const sortable = Sortable.create(sortableRef.current, {
      handle: '[data-drag-handle]',
      animation: 150,
      onEnd: async (evt) => {
        const reordered = [...sections];
        const [moved] = reordered.splice(evt.oldIndex ?? 0, 1);
        if (!moved) return;
        reordered.splice(evt.newIndex ?? 0, 0, moved);
        reordered.forEach((section, index) => {
          section.orderIndex = index;
        });
        setSections(reordered);
        await axios.patch(
          `/resumes/${resumeId}/sections/${moved.id}/order`,
          { orderIndex: evt.newIndex },
          { withCredentials: true },
        );
        void queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      },
    });

    return () => sortable.destroy();
  }, [resumeId, sections, queryClient, setSections]);

  const updateResume = useMutation({
    mutationFn: async (updates: Partial<ResumeResponse>) => {
      await axios.put(`/resumes/${resumeId}`, updates, { withCredentials: true });
    },
    onSuccess: () => {
      pushToast(t('resumeEditor.saved'));
      void queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
  });

  const togglePublic = async () => {
    try {
      await updateResume.mutateAsync({ isPublic: !data?.isPublic });
    } catch (error) {
      pushToast(t('resumeEditor.saveError'));
      console.error(error);
    }
  };

  if (!data) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <TemplatePicker
          currentTemplate={data.templateKey}
          onChange={(templateKey) => updateResume.mutate({ templateKey })}
        />
        <AiActions resumeId={resumeId} />
        <button
          type="button"
          onClick={togglePublic}
          className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          {data.isPublic ? t('resumeEditor.makePrivate') : t('resumeEditor.makePublic')}
        </button>
      </div>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{data.title}</h1>
            {data.atsScore !== null && (
              <p className="text-sm text-primary-600">{t('resumeEditor.atsScore', { score: data.atsScore })}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => pushToast(t('resumeEditor.exportDisabled'))}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-50"
            disabled
          >
            {t('resumeEditor.exportPdf')}
          </button>
        </header>
        <ul ref={sortableRef} className="space-y-4" aria-label={t('resumeEditor.sectionsAriaLabel')}>
          {sections.map((section) => (
            <li key={section.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize text-slate-900">{section.type}</h2>
                <button
                  type="button"
                  data-drag-handle
                  className="cursor-move rounded px-3 py-1 text-xs font-medium uppercase text-slate-500"
                  aria-label={t('resumeEditor.reorderSection', { section: section.type })}
                >
                  {t('resumeEditor.dragHandle')}
                </button>
              </div>
              <pre className="mt-2 overflow-auto rounded bg-slate-950/90 p-3 text-xs text-lime-200">
                {JSON.stringify(section.content, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
        <ResumePreview resume={data} />
      </div>
    </section>
  );
}
