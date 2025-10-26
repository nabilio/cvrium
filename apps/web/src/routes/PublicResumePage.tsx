import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { ResumePreview } from '@/features/resume/ResumePreview';

interface PublicResumeResponse {
  id: string;
  title: string;
  templateKey: string;
  sections: Array<{
    id: string;
    type: string;
    content: Record<string, unknown>;
  }>;
  isPublic: boolean;
  atsScore: number | null;
}

export function PublicResumePage(): JSX.Element {
  const { slug } = useParams({ from: '/p/$slug' });
  const { t } = useTranslation();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const { data } = useQuery({
    queryKey: ['public-resume', slug],
    queryFn: async () => {
      const response = await axios.get<PublicResumeResponse>(`/p/${slug}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(window.location.href, { margin: 1, width: 160 })
      .then(setQrDataUrl)
      .catch((error) => console.error(error));
  }, [data]);

  if (!data) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
          {data.atsScore !== null && (
            <p className="text-sm text-primary-600">{t('resumeEditor.atsScore', { score: data.atsScore })}</p>
          )}
        </div>
        {qrDataUrl && (
          <img
            src={qrDataUrl}
            alt={t('publicResume.qrAlt')}
            className="h-40 w-40 rounded-lg border border-slate-200 bg-white p-2 shadow"
          />
        )}
      </header>
      <ResumePreview resume={data} />
    </section>
  );
}
