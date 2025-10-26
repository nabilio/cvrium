import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { pushToast } from '@/components/Toaster';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const { t } = useTranslation();

  const onSubmit = async (data: LoginForm) => {
    try {
      await axios.post('/auth/login', data, { withCredentials: true });
      pushToast(t('auth.loginSuccess'));
    } catch (error) {
      pushToast(t('auth.loginError'));
      console.error(error);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-4">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{t('auth.loginTitle')}</h1>
        <p className="text-sm text-slate-600">{t('auth.loginSubtitle')}</p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {formState.errors.email && (
            <p className="text-sm text-rose-600">{formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {formState.errors.password && (
            <p className="text-sm text-rose-600">{formState.errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-white shadow hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          {t('auth.loginCta')}
        </button>
        <div>
          <a
            href="/auth/google"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {t('auth.loginWithGoogle')}
          </a>
        </div>
      </form>
    </section>
  );
}
