import { useState } from "react";

function Settings({ user, onSignOut }) {
  const [projectUrl, setProjectUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRole, setServiceRole] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = (event) => {
    event.preventDefault();
    setMessage("Configuration sauvegardée localement. Branchez votre projet Supabase réel pour persister ces valeurs.");
  };

  return (
    <div className="bg-[#f3f2ef] pb-16">
      <div className="page-shell">
        <aside className="page-sidebar">
          <h1 className="text-lg font-semibold text-slate-900">Paramètres</h1>
          <p className="text-sm text-slate-600">
            Gérez vos clés Supabase et OpenAI. Ces valeurs seront stockées de façon sécurisée côté serveur.
          </p>
          <button className="btn-secondary w-full" onClick={onSignOut}>
            Se déconnecter
          </button>
          {user ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Profil connecté</p>
              <p>{user.fullName}</p>
              <p>{user.email}</p>
            </div>
          ) : null}
        </aside>
        <section className="page-content">
          <form className="form-section" onSubmit={handleSave}>
            <h2 className="text-lg font-semibold text-slate-900">Connexion Supabase</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="projectUrl">Project URL</label>
                <input
                  id="projectUrl"
                  placeholder="https://xyzcompany.supabase.co"
                  value={projectUrl}
                  onChange={(event) => setProjectUrl(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="anonKey">Anon key</label>
                <input
                  id="anonKey"
                  placeholder="supabase_anon_key"
                  value={anonKey}
                  onChange={(event) => setAnonKey(event.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="serviceRole">Service role key</label>
              <input
                id="serviceRole"
                placeholder="supabase_service_role"
                value={serviceRole}
                onChange={(event) => setServiceRole(event.target.value)}
              />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Clés OpenAI</h2>
            <div className="flex flex-col gap-2">
              <label htmlFor="openAiKey">API key</label>
              <input
                id="openAiKey"
                placeholder="sk-..."
                value={openAiKey}
                onChange={(event) => setOpenAiKey(event.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-fit">
              Sauvegarder la configuration
            </button>
            {message ? <p className="text-xs text-[#0a66c2]">{message}</p> : null}
          </form>
        </section>
      </div>
    </div>
  );
}

export default Settings;
