import { useTranslation } from 'react-i18next';

const features = [
  'pricing.features.atsOptimized',
  'pricing.features.unlimitedResumes',
  'pricing.features.pdfDocx',
  'pricing.features.aiQuota',
  'pricing.features.publicLinks',
];

export function PricingPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          {t('pricing.tagline')}
        </p>
        <h1 className="text-4xl font-bold text-slate-900">{t('pricing.title')}</h1>
        <p className="text-lg text-slate-600">{t('pricing.subtitle')}</p>
      </header>
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-5xl font-bold text-slate-900">3 €</p>
        <p className="text-sm text-slate-500">{t('pricing.perMonth')}</p>
        <ul className="mt-6 space-y-3 text-left">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
              <span aria-hidden="true" className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />
              <span>{t(feature)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <form action="/billing/stripe/checkout" method="post">
            <button
              type="submit"
              className="w-full rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {t('pricing.subscribeStripe')}
            </button>
          </form>
          <form action="/billing/paypal/create" method="post">
            <button
              type="submit"
              className="w-full rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {t('pricing.subscribePaypal')}
            </button>
          </form>
        </div>
        <p className="mt-4 text-xs text-slate-500">{t('pricing.trial')}</p>
      </div>
    </section>
  );
}
