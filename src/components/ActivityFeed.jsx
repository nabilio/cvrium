const activities = [
  {
    id: 1,
    description: "Vous avez généré une version anglaise du CV Product Manager",
    time: "Il y a 3 heures",
  },
  {
    id: 2,
    description: "Nouvelle invitation envoyée à Inès Dupont",
    time: "Hier",
  },
  {
    id: 3,
    description: "L'IA a suggéré une amélioration pour la section Résumé",
    time: "Il y a 2 jours",
  },
];

function ActivityFeed() {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>
      <ul className="mt-4 space-y-3">
        {activities.map((activity) => (
          <li key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <p>{activity.description}</p>
            <p className="text-xs text-slate-400">{activity.time}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityFeed;
