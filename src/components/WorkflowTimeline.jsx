const steps = [
  {
    title: "Inscription e-mail",
    description: "Créez votre espace sécurisé pour stocker profils et CV dans Supabase.",
    icon: "1",
  },
  {
    title: "Dashboard inspiré de LinkedIn",
    description: "Gérez brouillons, invitations réseau et conversations dans une interface familière.",
    icon: "2",
  },
  {
    title: "Création assistée",
    description: "Ajoutez une photo, importez un CV existant, pré-remplissez des sections avec l'IA.",
    icon: "3",
  },
  {
    title: "Aperçu et traduction",
    description: "Prévisualisez dans un nouvel onglet et générez la version anglaise en un clic.",
    icon: "4",
  },
];

function WorkflowTimeline() {
  return (
    <section className="border-t border-slate-200 bg-[#f3f2ef]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 lg:flex-row lg:items-start">
        <div className="lg:w-1/3">
          <h2 className="section-title">Un parcours simple, guidé par l'IA</h2>
          <p className="mt-4 text-sm text-slate-600">
            Depuis votre inscription jusqu'à l'envoi d'un CV optimisé, CVrium vous accompagne étape par étape avec
            des suggestions intelligentes et des outils de productivité.
          </p>
        </div>
        <ol className="grid flex-1 gap-6">
          {steps.map((step) => (
            <li key={step.title} className="card flex gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#0a66c2]/10 text-lg font-semibold text-[#0a66c2]">
                {step.icon}
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default WorkflowTimeline;
