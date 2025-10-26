import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/account/billing', labelKey: 'nav.billing' },
  { to: '/admin', labelKey: 'nav.admin' },
];

export function Header(): JSX.Element {
  const { t, i18n } = useTranslation();

  const switchLang = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    void i18n.changeLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-primary-600 focus:outline-none focus:ring">
          CVRUM
        </Link>
        <nav aria-label={t('nav.ariaLabel')} className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <button
            type="button"
            onClick={switchLang}
            className="rounded px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
        </nav>
      </div>
    </header>
  );
}
