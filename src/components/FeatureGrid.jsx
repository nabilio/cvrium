const features = [
  {
    title: "Création de CV",
    description:
      "Composez un CV moderne en choisissant des sections inspirées de LinkedIn et en enregistrant des brouillons illimités.",
    icon: "🧱",
  },
  {
    title: "Assistance IA ciblée",
    description:
      "Utilisez l'IA d'OpenAI pour pré-remplir des sections précises, ajuster le ton ou générer des suggestions d'amélioration.",
    icon: "✨",
  },
  {
    title: "Import intelligent",
    description:
      "Téléversez un CV PDF/DOCX existant pour qu'il soit restructuré automatiquement selon les meilleures pratiques.",
    icon: "📄",
  },
  {
    title: "Multilingue",
    description:
      "Créez votre CV en français et générez instantanément une version anglaise parfaitement alignée.",
    icon: "🌍",
  },
  {
    title: "Messagerie réseau",
    description:
      "Discutez avec vos pairs, échangez des conseils et partagez vos CV via une messagerie asynchrone.",
    icon: "💬",
  },
  {
    title: "Espace sécurisé",
    description:
      "Supabase gère vos comptes, vos brouillons et vos clés secrètes comme OpenAI en toute sécurité.",
    icon: "🔐",
  },
];

function FeatureGrid() {
  return (
    <section className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a66c2]/10 text-2xl">
              {feature.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureGrid;
