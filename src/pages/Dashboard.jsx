import { Link } from "react-router-dom";
import DraftList from "../components/DraftList.jsx";
import QuickActions from "../components/QuickActions.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";

function Dashboard({ user }) {
  return (
    <div className="bg-[#f3f2ef] pb-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0a66c2]">Bienvenue</p>
          <h1 className="text-3xl font-bold text-slate-900">Bonjour {user?.fullName || "!"}</h1>
          <p className="text-sm text-slate-600">
            Reprenez vos brouillons, générez un nouveau CV et gérez vos connexions professionnelles.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <QuickActions />
            <DraftList />
          </div>
          <aside className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Supabase & sécurité</h2>
              <p className="text-sm text-slate-600">
                Connectez votre projet Supabase pour synchroniser vos brouillons et gérer vos clés OpenAI en toute sécurité.
              </p>
              <Link to="/settings" className="btn-primary w-full">
                Accéder aux paramètres
              </Link>
            </div>
            <ActivityFeed />
          </aside>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
