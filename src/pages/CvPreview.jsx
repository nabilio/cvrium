import { useParams } from "react-router-dom";

const placeholder = {
  fullName: "Alex Martin",
  headline: "Product Manager",
  summary:
    "Product Manager avec 7 ans d'expérience dans la conception de solutions SaaS, spécialiste de la collaboration inter-équipes.",
  experience: [
    {
      role: "Product Manager Senior",
      company: "InnovateX",
      period: "2021 - Aujourd'hui",
      highlights: [
        "Pilotage d'une équipe produit de 6 personnes",
        "Lancement d'une fonctionnalité IA augmentant l'engagement de 32%",
      ],
    },
    {
      role: "Product Owner",
      company: "NextWave",
      period: "2018 - 2021",
      highlights: ["Backlog agile, coordination UX/UI", "Optimisation du NPS de 12 points"],
    },
  ],
  education: [
    { title: "Master Management de l'innovation", school: "HEC Paris", period: "2015 - 2017" },
  ],
  skills: ["Leadership", "Analyse de données", "Roadmap produit", "UX Research"],
};

function CvPreview() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">{placeholder.fullName}</h1>
          <p className="text-lg text-slate-600">{placeholder.headline}</p>
          <p className="text-sm text-slate-500">
            Aperçu simulé du brouillon {id}. Les données finales seront chargées depuis Supabase.
          </p>
        </header>
        <section className="mt-6 space-y-6">
          <article>
            <h2 className="text-base font-semibold uppercase tracking-wide text-slate-500">Résumé</h2>
            <p className="mt-2 text-sm text-slate-700">{placeholder.summary}</p>
          </article>
          <article>
            <h2 className="text-base font-semibold uppercase tracking-wide text-slate-500">Expériences</h2>
            <ul className="mt-3 space-y-4">
              {placeholder.experience.map((item) => (
                <li key={item.role}>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>
                      {item.role} – {item.company}
                    </span>
                    <span className="text-xs text-slate-500">{item.period}</span>
                  </div>
                  <ul className="ml-4 mt-2 list-disc space-y-1 text-sm text-slate-600">
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h2 className="text-base font-semibold uppercase tracking-wide text-slate-500">Formation</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {placeholder.education.map((item) => (
                <li key={item.title} className="flex items-center justify-between">
                  <span>
                    {item.title} – {item.school}
                  </span>
                  <span className="text-xs text-slate-500">{item.period}</span>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h2 className="text-base font-semibold uppercase tracking-wide text-slate-500">Compétences clés</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {placeholder.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#0a66c2]/10 px-3 py-1 text-xs font-semibold text-[#0a66c2]">
                  {skill}
                </span>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default CvPreview;
