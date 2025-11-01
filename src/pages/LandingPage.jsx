import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FeatureGrid from "../components/FeatureGrid.jsx";
import WorkflowTimeline from "../components/WorkflowTimeline.jsx";
import TestimonialsStrip from "../components/TestimonialsStrip.jsx";
import SupabaseIntegrationCard from "../components/SupabaseIntegrationCard.jsx";

const emailRegex = /.+@.+\..+/;

function LandingPage({ onSignIn, user }) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    agree: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email || !formData.fullName || !formData.password) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Adresse e-mail invalide.");
      return;
    }

    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const profile = {
      id: crypto.randomUUID(),
      fullName: formData.fullName,
      email: formData.email,
      title: "Créateur de CV", 
      photo: "",
      createdAt: Date.now(),
    };

    onSignIn(profile);
    navigate(from, { replace: true });
  };

  return (
    <div className="bg-gradient-to-b from-white via-white to-[#f3f2ef]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0a66c2]/10 px-4 py-2 text-sm font-semibold text-[#0a66c2]">
            <span className="h-2 w-2 rounded-full bg-[#0a66c2]"></span>
            Créez un CV professionnel en quelques minutes
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            La plateforme inspirée de LinkedIn qui associe design moderne et IA pour vos CV.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            CVrium vous accompagne depuis l'inscription jusqu'à l'envoi de vos candidatures : création assistée par IA,
            brouillons synchronisés, traduction en anglais et réseau professionnel intégré.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="badge bg-white text-[#0a66c2]">Prévisualisation instantanée</div>
            <div className="badge bg-white text-[#0a66c2]">IA OpenAI flexible</div>
            <div className="badge bg-white text-[#0a66c2]">Sauvegarde Supabase</div>
          </div>
        </div>
        <div className="flex w-full max-w-md flex-col gap-4">
          <div id="inscription" className="gradient-border">
            <div className="card">
              <div className="mb-6 space-y-1 text-center">
                <h2 className="text-2xl font-semibold text-slate-900">Inscription par e-mail</h2>
                <p className="text-sm text-slate-500">
                  Commencez gratuitement. La connexion Google sera disponible ultérieurement.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="fullName">Nom complet</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Ex. Alex Martin"
                    value={formData.fullName}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, fullName: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="email">Adresse e-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alex.martin@email.com"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    id="agree"
                    name="agree"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={formData.agree}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, agree: event.target.checked }))
                    }
                    required
                  />
                  <label htmlFor="agree" className="text-sm text-slate-600">
                    J'accepte de recevoir des recommandations personnalisées pour améliorer mes candidatures.
                  </label>
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Création du compte..." : "Créer mon espace"}
                </button>
              </form>
              <div className="mt-6 flex flex-col gap-2 text-center text-xs text-slate-500">
                <p>Déjà membre ? <span className="text-[#0a66c2]">Connectez-vous avec votre e-mail.</span></p>
                {user ? <p>Vous êtes connecté en tant que {user.fullName}.</p> : null}
              </div>
            </div>
          </div>
          <button className="btn-secondary w-full" type="button" disabled>
            Connexion Google (à venir)
          </button>
          <p className="text-center text-xs text-slate-500">
            Vos données sont sécurisées sur Supabase. Gérez vos clés OpenAI depuis les paramètres.
          </p>
        </div>
      </section>

      <FeatureGrid />
      <WorkflowTimeline />
      <SupabaseIntegrationCard />
      <TestimonialsStrip />
    </div>
  );
}

export default LandingPage;
