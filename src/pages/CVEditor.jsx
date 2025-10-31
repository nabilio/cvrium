import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Save,
  Eye,
  Shield,
  Sparkles,
  Plus,
  Trash2,
  Wand2,
  Image as ImageIcon,
  Upload,
  LayoutTemplate,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { CV_TEMPLATE_LIST } from '@/components/cv-templates';
import { callOpenAI } from '@/lib/openai';

const initialCvState = {
  id: null,
  status: 'draft',
  templateId: 'modern',
  title: '',
  language: 'fr',
  isAnonymous: false,
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    photoUrl: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
};

const CVEditor = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiCategory, setAiCategory] = useState('all');
  const [isParsing, setIsParsing] = useState(false);
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [cvData, setCvData] = useState(initialCvState);

  useEffect(() => {
    if (!id) {
      return;
    }

    const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
    const cv = cvs.find(item => item.id === id);
    if (cv) {
      setCvData(prev => ({
        ...prev,
        ...cv,
        id: cv.id,
        status: cv.status || 'draft',
        templateId: cv.templateId || 'modern',
        personalInfo: {
          ...prev.personalInfo,
          ...(cv.personalInfo || {}),
          photoUrl: cv.personalInfo?.photoUrl || '',
        },
        languages: cv.languages || [],
        certifications: cv.certifications || [],
      }));
    }
  }, [id, user.id]);

  const sanitizeForPrompt = (text) => text.replace(/`/g, '\\`');

  const handleImproveSummary = async () => {
    if (!cvData.summary.trim()) {
      toast({
        title: 'Résumé vide',
        description: "Veuillez d'abord écrire un résumé à améliorer.",
        variant: 'destructive',
      });
      return;
    }

    setIsImprovingSummary(true);
    toast({
      title: 'Amélioration IA en cours...',
      description: "L'IA peaufine votre résumé professionnel.",
    });

    try {
      const prompt = `Réécris et améliore ce résumé professionnel pour le rendre percutant, clair et concis. ` +
        `Conserve le même langage (français). Retourne uniquement le texte amélioré, sans guillemets ni introduction. Résumé : "${sanitizeForPrompt(cvData.summary)}"`;
      const improvedSummary = await callOpenAI(prompt);
      setCvData(prev => ({ ...prev, summary: improvedSummary.trim() }));
      toast({
        title: 'Résumé amélioré ! ✨',
        description: "Votre résumé professionnel a été mis à jour par l'IA.",
      });
    } catch (error) {
      console.error('Erreur d\'API OpenAI:', error);
      toast({
        title: "Oups ! L'IA a eu un contretemps.",
        description: 'Vérifiez votre clé API ou réessayez.',
        variant: 'destructive',
      });
    } finally {
      setIsImprovingSummary(false);
    }
  };

  const handleParseWithAI = async () => {
    if (!aiText.trim()) {
      toast({
        title: 'Champ vide',
        description: 'Veuillez coller du texte à analyser.',
        variant: 'destructive',
      });
      return;
    }

    setIsParsing(true);
    toast({
      title: 'Analyse IA en cours...',
      description: `L'IA lit votre texte pour la section : ${aiCategory}`,
    });

    try {
      let prompt = '';
      let jsonStructure = '';
      const sanitizedText = sanitizeForPrompt(aiText);

      switch (aiCategory) {
        case 'experience':
          jsonStructure = '{ "experience": [{ "company": "", "position": "", "period": "", "location": "", "description": "" }] }';
          prompt = `Extrais uniquement les expériences professionnelles de ce texte et retourne un objet JSON. Texte: \`${sanitizedText}\`. Le JSON doit respecter la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
          break;
        case 'education':
          jsonStructure = '{ "education": [{ "school": "", "degree": "", "period": "", "location": "" }] }';
          prompt = `Extrais uniquement la formation de ce texte et retourne un objet JSON. Texte: \`${sanitizedText}\`. Le JSON doit respecter la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
          break;
        case 'skills':
          jsonStructure = '{ "skills": [{ "category": "", "technologies": "" }] }';
          prompt = `Extrais uniquement les compétences de ce texte et retourne un objet JSON. Texte: \`${sanitizedText}\`. Le JSON doit respecter la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
          break;
        case 'summary':
          jsonStructure = '{ "summary": "" }';
          prompt = `Extrais uniquement le résumé professionnel de ce texte et retourne un objet JSON. Texte: \`${sanitizedText}\`. Le JSON doit respecter la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
          break;
        default:
          jsonStructure = '{ "personalInfo": { "fullName": "", "email": "", "phone": "" }, "summary": "", "experience": [{ "company": "", "position": "", "period": "", "location": "", "description": "" }], "education": [{ "school": "", "degree": "", "period": "", "location": "" }], "skills": [{ "category": "", "technologies": "" }], "languages": [{ "language": "", "level": "" }], "certifications": [{ "name": "", "issuer": "", "date": "" }] }';
          prompt = `Analyse ce CV et retourne un objet JSON structuré. Texte: \`${sanitizedText}\`. Le JSON doit respecter la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
      }

      const result = await callOpenAI(prompt);
      const parsedResult = JSON.parse(result);

      setCvData(prev => {
        const updated = { ...prev };
        if (parsedResult.personalInfo && aiCategory === 'all') {
          updated.personalInfo = { ...prev.personalInfo, ...parsedResult.personalInfo };
        }
        if (parsedResult.summary && (aiCategory === 'all' || aiCategory === 'summary')) {
          updated.summary = parsedResult.summary || prev.summary;
        }
        if (parsedResult.experience) {
          updated.experience = [...(prev.experience || []), ...parsedResult.experience];
        }
        if (parsedResult.education) {
          updated.education = [...(prev.education || []), ...parsedResult.education];
        }
        if (parsedResult.skills) {
          updated.skills = [...(prev.skills || []), ...parsedResult.skills];
        }
        if (parsedResult.languages) {
          updated.languages = [...(prev.languages || []), ...parsedResult.languages];
        }
        if (parsedResult.certifications) {
          updated.certifications = [...(prev.certifications || []), ...parsedResult.certifications];
        }
        return updated;
      });

      toast({
        title: 'Magie réussie ! ✨',
        description: "Les champs ont été pré-remplis par l'IA.",
      });
    } catch (error) {
      console.error("Erreur d'API OpenAI:", error);
      toast({
        title: 'Oups ! Une erreur est survenue.',
        description: "Vérifiez votre clé API ou réessayez. L'IA a peut-être eu du mal à comprendre le texte.",
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setCvData(prev => ({ ...prev, templateId }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Veuillez sélectionner un fichier de moins de 2 Mo.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result || '';
      setAiText(String(content));
      setSelectedFileName(file.name);
      toast({
        title: 'Ancien CV importé',
        description: "Le contenu du fichier a été ajouté au champ de l'assistant IA.",
      });
    };
    reader.onerror = () => {
      toast({
        title: 'Lecture impossible',
        description: 'Une erreur est survenue lors de la lecture du fichier.',
        variant: 'destructive',
      });
    };

    reader.readAsText(file);
  };

  const handleGenerateModernCV = async () => {
    if (!aiText.trim()) {
      toast({
        title: 'Ancien CV requis',
        description: 'Importez ou collez votre ancien CV avant de lancer la génération IA.',
        variant: 'destructive',
      });
      return;
    }

    setIsRegenerating(true);
    toast({
      title: 'Transformation IA en cours...',
      description: 'Nous restructurons votre CV dans un format moderne.',
    });

    try {
      const sanitizedText = sanitizeForPrompt(aiText);
      const prompt = `Tu es un expert RH. Transforme ce CV en version moderne, impactante et concise. ` +
        `Retourne uniquement un objet JSON respectant la structure suivante: { "title": "", "personalInfo": { "fullName": "", "email": "", "phone": "", "address": "", "linkedin": "", "website": "" }, "summary": "", ` +
        `"experience": [{ "company": "", "position": "", "period": "", "location": "", "description": "" }], "education": [{ "school": "", "degree": "", "period": "", "location": "" }], ` +
        `"skills": [{ "category": "", "technologies": "" }], "languages": [{ "language": "", "level": "" }], "certifications": [{ "name": "", "issuer": "", "date": "" }], "templateId": "" }. ` +
        `Choisis templateId parmi ["modern", "minimal", "elegant"]. ` +
        `Améliore le résumé et les expériences sans inventer de fausses informations. Voici le CV source: \`${sanitizedText}\``;

      const result = await callOpenAI(prompt);
      const parsed = JSON.parse(result);

      setCvData(prev => ({
        ...prev,
        status: prev.status || 'draft',
        templateId: parsed.templateId || prev.templateId || 'modern',
        title: parsed.title || prev.title || 'Mon CV Moderne',
        summary: parsed.summary || prev.summary,
        personalInfo: {
          ...prev.personalInfo,
          ...(parsed.personalInfo || {}),
          photoUrl: prev.personalInfo.photoUrl,
        },
        experience: parsed.experience || prev.experience,
        education: parsed.education || prev.education,
        skills: parsed.skills || prev.skills,
        languages: parsed.languages || prev.languages,
        certifications: parsed.certifications || prev.certifications,
      }));

      toast({
        title: 'CV modernisé !',
        description: 'Votre ancien CV a été restructuré dans un format moderne.',
      });
    } catch (error) {
      console.error('Erreur IA:', error);
      toast({
        title: 'Transformation impossible',
        description: "Impossible d'analyser le JSON retourné par l'IA. Réessayez avec un texte plus clair.",
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = (status = 'published') => {
    setLoading(true);
    setTimeout(() => {
      const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
      const cvId = id || cvData.id || Date.now().toString();
      const timestamps = {
        updatedAt: new Date().toISOString(),
        createdAt: cvData.createdAt || new Date().toISOString(),
      };

      const newCV = {
        ...cvData,
        ...timestamps,
        id: cvId,
        status,
        templateId: cvData.templateId || 'modern',
        userId: user.id,
      };

      const exists = cvs.some(cv => cv.id === cvId);
      const updatedCvs = exists
        ? cvs.map(cv => (cv.id === cvId ? newCV : cv))
        : [...cvs, newCV];

      localStorage.setItem(`cvs_${user.id}`, JSON.stringify(updatedCvs));
      setCvData(prev => ({ ...prev, id: cvId, status }));

      toast({
        title: status === 'draft' ? 'Brouillon enregistré ✨' : 'CV sauvegardé ! 🎉',
        description:
          status === 'draft'
            ? 'Vous pourrez reprendre la rédaction de ce CV à tout moment.'
            : 'Votre CV a été enregistré avec succès.',
      });

      setLoading(false);
      if (status === 'published') {
        navigate('/dashboard');
      }
    }, 600);
  };

  const handleDynamicChange = (section, index, field, value) => {
    setCvData(prev => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection[index] = {
        ...updatedSection[index],
        [field]: value,
      };
      return { ...prev, [section]: updatedSection };
    });
  };

  const addDynamicItem = (section, item) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), item],
    }));
  };

  const removeDynamicItem = (section, index) => {
    setCvData(prev => {
      const updatedSection = [...(prev[section] || [])];
      updatedSection.splice(index, 1);
      return { ...prev, [section]: updatedSection };
    });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoUrl = reader.result;
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          photoUrl,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const previewId = id || cvData.id || 'new';

  return (
    <>
      <Helmet>
        <title>{id ? 'Modifier' : 'Créer'} un CV - CV Generator Pro</title>
        <meta name="description" content="Créez ou modifiez votre CV professionnel" />
      </Helmet>
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold gradient-text">
                  {id ? 'Modifier le CV' : 'Nouveau CV'}
                </h1>
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                    cvData.status === 'draft'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {cvData.status === 'draft' ? 'Brouillon' : 'Publié'}
                </motion.span>
              </div>
              <p className="text-gray-400 mt-2">Remplissez les informations de votre CV</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(`/cv/preview/${previewId}`)}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" /> Aperçu
              </Button>
              <Button
                onClick={() => handleSave('draft')}
                variant="outline"
                disabled={loading}
                className="border-dashed border-purple-400 text-purple-300 hover:bg-purple-500/10"
              >
                <Save className="w-4 h-4 mr-2" /> Sauver en brouillon
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-4 h-4 mr-2" /> {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-effect p-6 rounded-2xl space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-cyan-400" /> Magie IA - Pré-remplissage
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Collez un CV existant, importez un fichier ou choisissez la section à remplir et laissez l'IA faire le travail.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateModernCV}
                  disabled={isRegenerating || !aiText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {isRegenerating ? 'Transformation...' : 'Moderniser le CV'}
                </Button>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex-1">
                  <Label htmlFor="ai-text" className="text-sm text-gray-300">Ancien CV ou texte brut</Label>
                  <Textarea
                    id="ai-text"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder="Collez votre texte ici..."
                    className="bg-white/5 border-white/10 min-h-[160px] mt-2"
                  />
                </div>
                <div className="lg:w-64 space-y-3">
                  <Label htmlFor="old-cv-upload" className="text-sm text-gray-300">
                    Importer un ancien CV (.txt, .md, .docx exporté en texte)
                  </Label>
                  <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-300">
                    <Label htmlFor="old-cv-upload" className="flex cursor-pointer items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>{selectedFileName || 'Choisir un fichier'}</span>
                    </Label>
                    <Input
                      id="old-cv-upload"
                      type="file"
                      accept=".txt,.md,.text,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Label htmlFor="ai-category" className="text-sm text-gray-300">Catégorie à remplir</Label>
                  <select
                    id="ai-category"
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="mt-2 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="all">Tout le CV</option>
                    <option value="summary">Résumé professionnel</option>
                    <option value="experience">Expériences professionnelles</option>
                    <option value="education">Formation</option>
                    <option value="skills">Compétences</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end">
                  <Button
                    onClick={handleParseWithAI}
                    disabled={isParsing}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {isParsing ? 'Analyse en cours...' : 'Lancer la magie ✨'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <LayoutTemplate className="w-6 h-6 text-purple-300" /> Templates modernes
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Choisissez un style de CV. Vous pourrez toujours changer de modèle dans l'aperçu.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {CV_TEMPLATE_LIST.map(template => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`group relative rounded-xl border p-4 text-left transition-all ${
                      cvData.templateId === template.id
                        ? 'border-purple-400/80 bg-white/10 shadow-lg'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-r ${template.accent} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    <div className="mt-4 space-y-1">
                      <p className="font-semibold text-white">{template.name}</p>
                      <p className="text-xs text-gray-300 leading-snug">{template.description}</p>
                    </div>
                    {cvData.templateId === template.id && (
                      <span className="absolute top-3 right-3 text-xs text-purple-200">Sélectionné</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" /> Paramètres du CV
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du CV</Label>
                  <Input
                    id="title"
                    value={cvData.title}
                    onChange={(e) => setCvData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: CV Développeur Full Stack"
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    value={cvData.language}
                    onChange={(e) => setCvData(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-2 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  id="anonymous"
                  checked={cvData.isAnonymous}
                  onCheckedChange={(checked) => setCvData(prev => ({ ...prev, isAnonymous: Boolean(checked) }))}
                />
                <Label htmlFor="anonymous" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4 text-purple-400" /> Version anonyme (masquer les informations personnelles)
                </Label>
              </div>
            </div>

            {!cvData.isAnonymous && (
              <div className="glass-effect p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">Informations personnelles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.personalInfo.email}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={cvData.personalInfo.address}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, address: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={cvData.personalInfo.linkedin}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Site web / Portfolio</Label>
                    <Input
                      id="website"
                      value={cvData.personalInfo.website}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, website: e.target.value },
                      }))}
                      className="mt-2 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" /> Photo de profil
                  </Label>
                  <div className="flex items-center gap-4">
                    {cvData.personalInfo.photoUrl && (
                      <img
                        src={cvData.personalInfo.photoUrl}
                        alt="Aperçu"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                      />
                    )}
                    <Label htmlFor="photoUpload" className="flex-1 cursor-pointer">
                      <div className="h-12 w-full flex items-center justify-center rounded-md border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Choisir un fichier</span>
                      </div>
                      <Input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Résumé professionnel</h2>
                <Button
                  onClick={handleImproveSummary}
                  disabled={isImprovingSummary || !cvData.summary.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isImprovingSummary ? 'Optimisation...' : 'Améliorer avec l\'IA'}
                </Button>
              </div>
              <Textarea
                value={cvData.summary}
                onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Décrivez votre profil professionnel, vos forces et vos objectifs."
                className="bg-white/5 border-white/10 min-h-[140px]"
              />
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Expérience</h2>
                <Button
                  onClick={() => addDynamicItem('experience', { company: '', position: '', period: '', location: '', description: '' })}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              {(cvData.experience || []).map((exp, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="Entreprise"
                      value={exp.company}
                      onChange={(e) => handleDynamicChange('experience', index, 'company', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Poste"
                      value={exp.position}
                      onChange={(e) => handleDynamicChange('experience', index, 'position', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="Période (ex: 2020 - 2023)"
                      value={exp.period}
                      onChange={(e) => handleDynamicChange('experience', index, 'period', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Lieu"
                      value={exp.location}
                      onChange={(e) => handleDynamicChange('experience', index, 'location', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Textarea
                    placeholder="Description des responsabilités..."
                    value={exp.description}
                    onChange={(e) => handleDynamicChange('experience', index, 'description', e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <Button
                    onClick={() => removeDynamicItem('experience', index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Formation</h2>
                <Button
                  onClick={() => addDynamicItem('education', { school: '', degree: '', period: '', location: '' })}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              {(cvData.education || []).map((edu, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="École / Université"
                      value={edu.school}
                      onChange={(e) => handleDynamicChange('education', index, 'school', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Diplôme"
                      value={edu.degree}
                      onChange={(e) => handleDynamicChange('education', index, 'degree', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="Période"
                      value={edu.period}
                      onChange={(e) => handleDynamicChange('education', index, 'period', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Lieu"
                      value={edu.location}
                      onChange={(e) => handleDynamicChange('education', index, 'location', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button
                    onClick={() => removeDynamicItem('education', index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Compétences</h2>
                <Button
                  onClick={() => addDynamicItem('skills', { category: '', technologies: '' })}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              {(cvData.skills || []).map((skill, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                  <Label className="text-xs text-gray-400">Compétence globale</Label>
                  <Input
                    placeholder="Ex: Ordonnancement, Cloud, Base de données"
                    value={skill.category}
                    onChange={(e) => handleDynamicChange('skills', index, 'category', e.target.value)}
                    className="bg-white/5 border-white/10 mb-2"
                  />
                  <Label className="text-xs text-gray-400">Technologies (séparées par une virgule)</Label>
                  <Input
                    placeholder="Ex: VTOM, Control M, AWS, Azure, Oracle"
                    value={skill.technologies}
                    onChange={(e) => handleDynamicChange('skills', index, 'technologies', e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <Button
                    onClick={() => removeDynamicItem('skills', index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Langues</h2>
                <Button
                  onClick={() => addDynamicItem('languages', { language: '', level: 'Courant (C1/C2)' })}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              {(cvData.languages || []).map((lang, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Langue (ex: Anglais)"
                      value={lang.language}
                      onChange={(e) => handleDynamicChange('languages', index, 'language', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => handleDynamicChange('languages', index, 'level', e.target.value)}
                      className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="Natif">Natif</option>
                      <option value="Bilingue">Bilingue</option>
                      <option value="Courant (C1/C2)">Courant (C1/C2)</option>
                      <option value="Intermédiaire (B1/B2)">Intermédiaire (B1/B2)</option>
                      <option value="Débutant (A1/A2)">Débutant (A1/A2)</option>
                    </select>
                  </div>
                  <Button
                    onClick={() => removeDynamicItem('languages', index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Certifications</h2>
                <Button
                  onClick={() => addDynamicItem('certifications', { name: '', issuer: '', date: '' })}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              {(cvData.certifications || []).map((cert, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      placeholder="Nom de la certification"
                      value={cert.name}
                      onChange={(e) => handleDynamicChange('certifications', index, 'name', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <Input
                      placeholder="Organisme de délivrance"
                      value={cert.issuer}
                      onChange={(e) => handleDynamicChange('certifications', index, 'issuer', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Input
                    placeholder="Date d'obtention"
                    value={cert.date}
                    onChange={(e) => handleDynamicChange('certifications', index, 'date', e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                  <Button
                    onClick={() => removeDynamicItem('certifications', index)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default CVEditor;
