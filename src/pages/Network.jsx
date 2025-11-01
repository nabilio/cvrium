import { useMemo, useState } from "react";

const suggestions = [
  { id: "1", name: "Sophie Laurent", headline: "Head of Product @ DataPulse", mutualConnections: 5 },
  { id: "2", name: "Amine Rahmani", headline: "Lead Engineer @ CloudNova", mutualConnections: 2 },
  { id: "3", name: "Claire Dubois", headline: "Consultante Carrière", mutualConnections: 7 },
];

function Network() {
  const [query, setQuery] = useState("");
  const [invited, setInvited] = useState([]);

  const filtered = useMemo(() => {
    if (!query) return suggestions;
    return suggestions.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleInvite = (id) => {
    setInvited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="bg-[#f3f2ef] pb-16">
      <div className="page-shell">
        <aside className="page-sidebar">
          <h1 className="text-lg font-semibold text-slate-900">Réseau</h1>
          <p className="text-sm text-slate-600">
            Recherchez des utilisateurs et envoyez des invitations, comme sur LinkedIn.
          </p>
          <input
            type="search"
            placeholder="Rechercher un membre..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-4"
          />
          <p className="text-xs text-slate-500">Les invitations sont envoyées de manière asynchrone.</p>
        </aside>
        <section className="page-content">
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((person) => (
              <article key={person.id} className="card">
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{person.name}</h2>
                    <p className="text-sm text-slate-500">{person.headline}</p>
                  </div>
                  <span className="badge bg-[#0a66c2]/10 text-[#0a66c2]">
                    {person.mutualConnections} relations en commun
                  </span>
                </header>
                <button
                  className="btn-primary mt-4"
                  type="button"
                  onClick={() => handleInvite(person.id)}
                  disabled={invited.includes(person.id)}
                >
                  {invited.includes(person.id) ? "Invitation envoyée" : "Inviter"}
                </button>
              </article>
            ))}
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun membre ne correspond à cette recherche.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Network;
