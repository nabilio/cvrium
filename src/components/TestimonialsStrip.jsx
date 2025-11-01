const testimonials = [
  {
    name: "Camille, UX Designer",
    quote:
      "Grâce à l'import automatique, mon ancien CV a été transformé en un profil professionnel que je peux ajuster section par section.",
  },
  {
    name: "Thomas, Product Manager",
    quote:
      "L'aperçu instantané et la traduction en anglais m'ont permis de postuler à l'international en une après-midi.",
  },
  {
    name: "Nadia, Développeuse IA",
    quote:
      "Je peux demander à l'IA de reformuler chaque expérience avec un ton plus percutant directement dans l'éditeur.",
  },
];

function TestimonialsStrip() {
  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14">
        <h2 className="section-title text-center">Ils utilisent CVrium pour décrocher leur prochain poste</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="card">
              <blockquote className="text-sm text-slate-600">“{item.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-slate-900">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsStrip;
