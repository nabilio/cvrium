import { Link } from "react-router-dom";

function SupabaseIntegrationCard() {
  return (
    <section className="border-t border-slate-200 bg-[#0a66c2]/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <h2 className="section-title">Une base solide avec Supabase</h2>
          <p className="text-sm text-slate-600">
            Authentification sécurisée, stockage chiffré et Edge Functions pour orchestrer vos appels à OpenAI — CVrium s'appuie
            sur Supabase pour offrir des performances fiables et une gestion simple des secrets.
          </p>
          <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0a66c2]">▹</span>
              Comptes utilisateurs, profils et brouillons synchronisés
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0a66c2]">▹</span>
              Edge Functions pour la génération IA et la traduction
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0a66c2]">▹</span>
              Stockage de fichiers pour les photos et CV importés
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[#0a66c2]">▹</span>
              Coffre-fort des clés OpenAI & intégrations tierces
            </li>
          </ul>
          <Link to="/settings" className="btn-secondary w-fit">
            Configurer mes clés et secrets
          </Link>
        </div>
        <div className="card max-w-md">
          <h3 className="text-base font-semibold text-slate-900">Statut de connexion fictif</h3>
          <p className="mt-2 text-sm text-slate-600">
            En mode prototype, nous simulons la connexion Supabase. Les points d'intégration sont prêts pour une connexion réelle.
          </p>
          <dl className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <dt>Authentification</dt>
              <dd className="font-semibold text-[#0a66c2]">E-mail activé</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Google OAuth</dt>
              <dd className="font-medium text-slate-400">Planifié</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Edge Functions</dt>
              <dd className="font-semibold text-[#0a66c2]">Prêtes pour OpenAI</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default SupabaseIntegrationCard;
