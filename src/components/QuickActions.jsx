import { Link } from "react-router-dom";

const actions = [
  {
    title: "Créer un CV",
    description: "Démarrez un document vierge et prévoyez des sections inspirées de LinkedIn.",
    cta: "Nouveau CV",
    href: "/cv/new",
  },
  {
    title: "Importer un ancien CV",
    description: "Déposez votre PDF/DOCX pour le restructurer grâce à l'IA.",
    cta: "Importer",
    href: "/cv/new#import",
  },
  {
    title: "Explorer les brouillons",
    description: "Consultez l'historique de vos CV enregistrés sur Supabase.",
    cta: "Voir les brouillons",
    href: "#drafts",
  },
];

function QuickActions() {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2>
      <p className="mt-2 text-sm text-slate-600">
        Retrouvez les fonctionnalités essentielles de CVrium en un clic.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <article key={action.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
            <h3 className="text-base font-semibold text-slate-900">{action.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{action.description}</p>
            <Link to={action.href} className="btn-primary mt-4 inline-flex">
              {action.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
