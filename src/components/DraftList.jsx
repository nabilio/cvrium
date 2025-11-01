import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const mockedDrafts = [
  {
    id: "1",
    title: "CV - Product Manager",
    status: "Dernière modification il y a 2 jours",
    template: "Moderne LinkedIn",
  },
  {
    id: "2",
    title: "CV - Développeuse IA",
    status: "Brouillon enregistré ce matin",
    template: "Élégant",
  },
];

function DraftList() {
  const drafts = useMemo(() => mockedDrafts, []);
  const navigate = useNavigate();

  const handlePreview = (draftId) => {
    window.open(`/cv/preview/${draftId}`, "_blank", "noopener");
  };

  const handleContinue = (draftId) => {
    navigate(`/cv/new?draft=${draftId}`);
  };

  return (
    <section id="drafts" className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Mes brouillons</h2>
          <p className="text-sm text-slate-600">
            Stockés dans Supabase et synchronisés avec vos sessions.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate("/cv/new")}>
          Nouveau brouillon
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {drafts.map((draft) => (
          <article
            key={draft.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-inner sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900">{draft.title}</h3>
              <p className="text-xs text-slate-500">{draft.template}</p>
              <p className="mt-1 text-sm text-slate-600">{draft.status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-secondary" onClick={() => handlePreview(draft.id)}>
                Aperçu
              </button>
              <button className="btn-primary" onClick={() => handleContinue(draft.id)}>
                Continuer
              </button>
            </div>
          </article>
        ))}
        {drafts.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun brouillon pour le moment.</p>
        ) : null}
      </div>
    </section>
  );
}

export default DraftList;
