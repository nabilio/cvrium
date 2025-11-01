import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const initialForm = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: "",
  education: "",
  skills: "",
  language: "fr",
};

const aiTargets = [
  { id: "summary", label: "Résumé professionnel" },
  { id: "experience", label: "Expériences" },
  { id: "education", label: "Formation" },
  { id: "skills", label: "Compétences" },
];

function CvBuilder({ user }) {
  const [form, setForm] = useState(initialForm);
  const [photoPreview, setPhotoPreview] = useState("");
  const [aiSelection, setAiSelection] = useState(["summary"]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [languageOptions, setLanguageOptions] = useState({ fr: true, en: false });

  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const draftId = params.get("draft");
    if (draftId) {
      const storedDraft = localStorage.getItem(`cvrium-draft-${draftId}`);
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft);
          setForm(parsed.form ?? initialForm);
          setPhotoPreview(parsed.photo ?? "");
          setLanguageOptions(parsed.languages ?? { fr: true, en: false });
          setStatusMessage(`Brouillon ${draftId} restauré.`);
        } catch (error) {
          console.warn("Draft parsing error", error);
        }
      }
    }
  }, [params]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result?.toString() ?? "");
    };
    reader.readAsDataURL(file);
  };

  const toggleTarget = (targetId) => {
    setAiSelection((prev) =>
      prev.includes(targetId) ? prev.filter((item) => item !== targetId) : [...prev, targetId]
    );
  };

  const handleAskAi = () => {
    if (!aiSelection.length) {
      setStatusMessage("Sélectionnez au moins une section à enrichir avec l'IA.");
      return;
    }
    const affectedSections = aiSelection.join(", ");
    setStatusMessage(
      `Requête IA prête pour : ${affectedSections}. Message envoyé aux Edge Functions Supabase (simulation).`
    );
  };

  const handleSaveDraft = () => {
    const draftId = params.get("draft") ?? crypto.randomUUID();
    const payload = {
      form,
      photo: photoPreview,
      languages: languageOptions,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`cvrium-draft-${draftId}`, JSON.stringify(payload));
    setStatusMessage(`Brouillon ${draftId} enregistré. Prochaine étape : synchronisation Supabase.`);
  };

  const handlePreview = () => {
    const previewId = params.get("draft") ?? "temp";
    const previewWindow = window.open(`/cv/preview/${previewId}`, "_blank", "noopener");
    if (!previewWindow) {
      setStatusMessage("Veuillez autoriser l'ouverture des popups pour voir l'aperçu.");
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportFile({ name: file.name, size: file.size });
    setStatusMessage(
      `Fichier ${file.name} prêt à être analysé. Envoi prévu aux Edge Functions pour extraction.`
    );
  };

  const toggleLanguage = (code) => {
    setLanguageOptions((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="bg-[#f3f2ef] pb-20">
      <div className="page-shell">
        <aside className="page-sidebar">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">Progression</h2>
            <p className="text-sm text-slate-600">
              Les données seront synchronisées avec Supabase pour un accès sur tous vos appareils.
            </p>
            {statusMessage ? <p className="rounded-xl bg-white p-3 text-xs text-[#0a66c2]">{statusMessage}</p> : null}
          </div>
          <div className="space-y-4">
            <button className="btn-primary w-full" onClick={handleSaveDraft}>
              Enregistrer le brouillon
            </button>
            <button className="btn-secondary w-full" onClick={handlePreview}>
              Aperçu dans un nouvel onglet
            </button>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Langues générées</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={languageOptions.fr}
                onChange={() => toggleLanguage("fr")}
                disabled
              />
              Français (par défaut)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={languageOptions.en}
                onChange={() => toggleLanguage("en")}
              />
              Anglais
            </label>
            <p className="text-xs text-slate-500">
              D'autres langues seront disponibles prochainement.
            </p>
          </div>
        </aside>

        <section className="page-content" id="import">
          <div className="form-section">
            <h2 className="text-lg font-semibold text-slate-900">Informations principales</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName">Nom complet</label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) => handleFormChange("fullName", event.target.value)}
                  placeholder="Ex. Alex Martin"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="headline">Titre professionnel</label>
                <input
                  id="headline"
                  value={form.headline}
                  onChange={(event) => handleFormChange("headline", event.target.value)}
                  placeholder="Product Manager"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleFormChange("email", event.target.value)}
                  placeholder="alex@email.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => handleFormChange("phone", event.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="location">Localisation</label>
                <input
                  id="location"
                  value={form.location}
                  onChange={(event) => handleFormChange("location", event.target.value)}
                  placeholder="Paris, France"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="summary">Résumé professionnel</label>
              <textarea
                id="summary"
                rows={4}
                value={form.summary}
                onChange={(event) => handleFormChange("summary", event.target.value)}
                placeholder="Décrivez votre proposition de valeur..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="text-lg font-semibold text-slate-900">Photo de profil</h2>
            <p className="text-sm text-slate-600">
              Ajoutez une photo professionnelle qui sera stockée dans le bucket Supabase Storage.
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
                {photoPreview ? (
                  <img src={photoPreview} alt="Prévisualisation" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">Aperçu</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                <p className="text-xs text-slate-500">
                  Formats acceptés : JPG, PNG. La compression se fera côté Supabase Functions.
                </p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="text-lg font-semibold text-slate-900">Importer un CV existant</h2>
            <p className="text-sm text-slate-600">
              Déposez un fichier PDF ou DOCX pour extraire le contenu et le restructurer automatiquement.
            </p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleImportFile} />
            {importFile ? (
              <p className="text-xs text-[#0a66c2]">
                {importFile.name} ({Math.round(importFile.size / 1024)} Ko) — prêt à être analysé par les Edge Functions.
              </p>
            ) : null}
          </div>

          <div className="form-section">
            <h2 className="text-lg font-semibold text-slate-900">Sections du CV</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="experience">Expériences professionnelles</label>
                <textarea
                  id="experience"
                  rows={6}
                  value={form.experience}
                  onChange={(event) => handleFormChange("experience", event.target.value)}
                  placeholder="Décrivez vos dernières expériences..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="education">Formation</label>
                <textarea
                  id="education"
                  rows={6}
                  value={form.education}
                  onChange={(event) => handleFormChange("education", event.target.value)}
                  placeholder="Listez vos diplômes et certifications..."
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="skills">Compétences clés</label>
              <textarea
                id="skills"
                rows={4}
                value={form.skills}
                onChange={(event) => handleFormChange("skills", event.target.value)}
                placeholder="Ex. Gestion de produit, Analyse de données, Leadership..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="text-lg font-semibold text-slate-900">Remplissage ciblé par IA</h2>
            <p className="text-sm text-slate-600">
              Sélectionnez les sections à améliorer et indiquez vos instructions. L'appel sera traité par une Edge Function
              Supabase utilisant l'API OpenAI.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {aiTargets.map((target) => (
                <label key={target.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={aiSelection.includes(target.id)}
                    onChange={() => toggleTarget(target.id)}
                  />
                  {target.label}
                </label>
              ))}
            </div>
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="Ex. Reformule en mettant l'accent sur la gestion d'équipe et les résultats chiffrés."
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Modèle : OpenAI (configurable)</span>
              <span>Mode : Ton professionnel</span>
            </div>
            <button type="button" className="btn-primary w-fit" onClick={handleAskAi}>
              Pré-remplir les sections sélectionnées
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CvBuilder;
