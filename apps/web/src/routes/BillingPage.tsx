import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { pushToast } from '@/components/Toaster';

export function BillingPage(): JSX.Element {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const openStripePortal = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ url: string }>('/billing/stripe/portal', { withCredentials: true });
      window.location.href = response.data.url;
    } catch (error) {
      pushToast(t('billing.portalError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{t('billing.title')}</h1>
        <p className="text-sm text-slate-600">{t('billing.subtitle')}</p>
      </header>
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t('billing.currentPlan')}</h2>
        <p className="text-sm text-slate-600">{t('billing.planDescription')}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openStripePortal}
            disabled={loading}
            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50"
          >
            {loading ? t('billing.loading') : t('billing.manageStripe')}
          </button>
          <form action="/billing/paypal/create" method="post" className="w-full">
            <button
              type="submit"
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {t('billing.managePaypal')}
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-slate-500">{t('billing.trialInfo')}</p>
      </article>
    </section>
  );
}
