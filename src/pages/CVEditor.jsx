import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate, useParams } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Save, Eye, Shield, Sparkles, Plus, Trash2, Wand2, Image as ImageIcon, Upload } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { useToast } from '@/components/ui/use-toast';
    import DashboardLayout from '@/components/DashboardLayout';
    import { callOpenAI } from '@/lib/openai';

    const CVEditor = ({ user, onLogout }) => {
      const navigate = useNavigate();
      const { id } = useParams();
      const { toast } = useToast();
      const [loading, setLoading] = useState(false);
      const [aiText, setAiText] = useState('');
      const [isParsing, setIsParsing] = useState(false);
      const [isImprovingSummary, setIsImprovingSummary] = useState(false);
      const [aiCategory, setAiCategory] = useState('all');

      const [cvData, setCvData] = useState({
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
      });

      useEffect(() => {
        if (id) {
          const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
          const cv = cvs.find(c => c.id === id);
          if (cv) {
            setCvData(prevData => ({
              ...prevData,
              ...cv,
              personalInfo: {
                ...prevData.personalInfo,
                ...(cv.personalInfo || {}),
                photoUrl: cv.personalInfo?.photoUrl || '',
              },
              languages: cv.languages || [],
              certifications: cv.certifications || [],
            }));
          }
        }
      }, [id, user.id]);
      
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
        toast({ title: "Amélioration IA en cours...", description: "L'IA peaufine votre résumé professionnel." });

        try {
            const prompt = `Réécris et améliore ce résumé professionnel pour le rendre plus percutant et concis. Conserve le même langage (français). Voici le résumé : "${cvData.summary}". Ne retourne que le texte du résumé amélioré, sans guillemets ni phrases d'introduction.`;
            const improvedSummary = await callOpenAI(prompt, false);
            setCvData(prev => ({ ...prev, summary: improvedSummary.trim() }));
            toast({
                title: "Résumé amélioré ! ✨",
                description: "Votre résumé professionnel a été mis à jour par l'IA.",
            });
        } catch (error) {
            console.error("Erreur d'API OpenAI:", error);
            toast({
                title: "Oups ! L'IA a eu un contretemps.",
                description: "Vérifiez votre clé API ou réessayez.",
                variant: "destructive",
            });
        } finally {
            setIsImprovingSummary(false);
        }
      };

      const handleParseWithAI = async () => {
        if (!aiText.trim()) {
            toast({
                title: 'Champ vide',
                description: "Veuillez coller du texte à analyser.",
                variant: 'destructive',
            });
            return;
        }
        setIsParsing(true);
        toast({ title: "Analyse IA en cours...", description: `L'IA lit votre texte pour la section : ${aiCategory}` });

        try {
            let prompt = '';
            let jsonStructure = '';

            switch (aiCategory) {
              case 'experience':
                jsonStructure = `{ "experience": [{ "company": "", "position": "", "period": "", "location": "", "description": "" }] }`;
                prompt = `Extrais uniquement les expériences professionnelles de ce texte et retourne un objet JSON. Voici le texte : "${aiText}". Le JSON doit avoir la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
                break;
              case 'education':
                jsonStructure = `{ "education": [{ "school": "", "degree": "", "period": "", "location": "" }] }`;
                prompt = `Extrais uniquement la formation de ce texte et retourne un objet JSON. Voici le texte : "${aiText}". Le JSON doit avoir la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
                break;
              case 'skills':
                jsonStructure = `{ "skills": [{ "category": "", "technologies": "" }] }`;
                prompt = `Extrais uniquement les compétences de ce texte et retourne un objet JSON. Voici le texte : "${aiText}". Le JSON doit avoir la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
                break;
              case 'summary':
                jsonStructure = `{ "summary": "" }`;
                prompt = `Extrais uniquement le résumé professionnel de ce texte et retourne un objet JSON. Voici le texte : "${aiText}". Le JSON doit avoir la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
                break;
              default: // 'all'
                jsonStructure = `{ "personalInfo": { "fullName": "", "email": "", "phone": "" }, "summary": "", "experience": [{ "company": "", "position": "", "period": "", "location": "", "description": "" }], "education": [{ "school": "", "degree": "", "period": "", "location": "" }], "skills": [{ "category": "", "technologies": "" }], "languages": [{ "language": "", "level": "" }], "certifications": [{ "name": "", "issuer": "", "date": "" }] }`;
                prompt = `Extrais les informations de ce texte de CV et retourne un objet JSON. Voici le texte : "${aiText}". Le JSON doit avoir la structure suivante : ${jsonStructure}. Ne retourne que le JSON.`;
            }
            
            const result = await callOpenAI(prompt, true);
            const parsedResult = JSON.parse(result);

            setCvData(prev => {
                const newData = { ...prev };
                if (parsedResult.personalInfo && (aiCategory === 'all')) newData.personalInfo = { ...prev.personalInfo, ...parsedResult.personalInfo };
                if (parsedResult.summary && (aiCategory === 'all' || aiCategory === 'summary')) newData.summary = parsedResult.summary || prev.summary;
                if (parsedResult.experience) newData.experience = [...(prev.experience || []), ...parsedResult.experience];
                if (parsedResult.education) newData.education = [...(prev.education || []), ...parsedResult.education];
                if (parsedResult.skills) newData.skills = [...(prev.skills || []), ...parsedResult.skills];
                if (parsedResult.languages) newData.languages = [...(prev.languages || []), ...parsedResult.languages];
                if (parsedResult.certifications) newData.certifications = [...(prev.certifications || []), ...parsedResult.certifications];
                return newData;
            });

            toast({
                title: "Magie réussie ! ✨",
                description: "Les champs ont été pré-remplis par l'IA.",
            });
        } catch (error) {
            console.error("Erreur d'API OpenAI:", error);
            toast({
                title: "Oups ! Une erreur est survenue.",
                description: "Vérifiez votre clé API ou réessayez. L'IA a peut-être eu du mal à comprendre le texte.",
                variant: "destructive",
            });
        } finally {
            setIsParsing(false);
        }
      };

      const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
          const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
          const newCV = {
            ...cvData,
            id: id || Date.now().toString(),
            userId: user.id,
            updatedAt: new Date().toISOString(),
            createdAt: cvData.createdAt || new Date().toISOString(),
          };

          let updatedCvs;
          if (id) {
            updatedCvs = cvs.map(cv => cv.id === id ? newCV : cv);
          } else {
            updatedCvs = [...cvs, newCV];
          }

          localStorage.setItem(`cvs_${user.id}`, JSON.stringify(updatedCvs));
          
          toast({
            title: "CV sauvegardé ! 🎉",
            description: "Votre CV a été enregistré avec succès",
          });
          setLoading(false);
          navigate('/dashboard');
        }, 1000);
      };

      const handleDynamicChange = (section, index, field, value) => {
          const newSectionData = [...cvData[section]];
          newSectionData[index][field] = value;
          setCvData({ ...cvData, [section]: newSectionData });
      };
      
      const addDynamicItem = (section, item) => {
          setCvData({ ...cvData, [section]: [...(cvData[section] || []), item] });
      };

      const removeDynamicItem = (section, index) => {
          const newSectionData = [...cvData[section]];
          newSectionData.splice(index, 1);
          setCvData({ ...cvData, [section]: newSectionData });
      };

      const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, photoUrl: reader.result } });
          };
          reader.readAsDataURL(file);
        }
      };

      return (
        <>
          <Helmet>
            <title>{id ? 'Modifier' : 'Créer'} un CV - CV Generator Pro</title>
            <meta name="description" content="Créez ou modifiez votre CV professionnel" />
          </Helmet>
          <DashboardLayout user={user} onLogout={onLogout}>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 gradient-text">
                    {id ? 'Modifier le CV' : 'Nouveau CV'}
                  </h1>
                  <p className="text-gray-400">Remplissez les informations de votre CV</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate(`/cv/preview/${id || 'new'}`)}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Aperçu
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Save className="w-4 h-4 mr-2" /> {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                
                <div className="glass-effect p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-cyan-400" /> Magie IA - Pré-remplissage
                    </h2>
                    <p className="text-gray-400 mb-4 text-sm">Collez un CV existant, choisissez la section à remplir, et laissez l'IA faire le travail. Magique !</p>
                    <Textarea
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        placeholder="Collez votre texte ici..."
                        className="bg-white/5 border-white/10 min-h-[150px] mb-4"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1">
                          <Label htmlFor="ai-category">Catégorie à remplir</Label>
                          <select
                            id="ai-category"
                            value={aiCategory}
                            onChange={(e) => setAiCategory(e.target.value)}
                            className="mt-2 w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                          >
                            <option value="all">Tout le CV</option>
                            <option value="summary">Résumé Professionnel</option>
                            <option value="experience">Expériences Professionnelles</option>
                            <option value="education">Formation</option>
                            <option value="skills">Compétences</option>
                          </select>
                      </div>
                      <div className="flex-1 flex items-end">
                        <Button onClick={handleParseWithAI} disabled={isParsing} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                            {isParsing ? 'Analyse en cours...' : 'Lancer la magie ✨'}
                        </Button>
                      </div>
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
                        onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
                        placeholder="Ex: CV Développeur Full Stack"
                        className="mt-2 bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Langue</Label>
                      <select
                        id="language"
                        value={cvData.language}
                        onChange={(e) => setCvData({ ...cvData, language: e.target.value })}
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
                      onCheckedChange={(checked) => setCvData({ ...cvData, isAnonymous: checked })}
                    />
                    <Label htmlFor="anonymous" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-4 h-4 text-purple-400" /> Version anonyme (masquer les informations personnelles)
                    </Label>
                  </div>
                </div>

                {!cvData.isAnonymous && (
                  <div className="glass-effect p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Informations Personnelles</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input id="fullName" value={cvData.personalInfo.fullName} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, fullName: e.target.value }})} className="mt-2 bg-white/5 border-white/10" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={cvData.personalInfo.email} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, email: e.target.value }})} className="mt-2 bg-white/5 border-white/10" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" value={cvData.personalInfo.phone} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, phone: e.target.value }})} className="mt-2 bg-white/5 border-white/10" />
                      </div>
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" value={cvData.personalInfo.address} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, address: e.target.value }})} className="mt-2 bg-white/5 border-white/10" />
                      </div>
                    </div>
                    <div className="mt-4">
                        <Label className="flex items-center gap-2 mb-2"><ImageIcon className="w-4 h-4" /> Photo de profil</Label>
                        <div className="flex items-center gap-4">
                            {cvData.personalInfo.photoUrl && (
                                <img src={cvData.personalInfo.photoUrl} alt="Aperçu" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
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
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">Résumé Professionnel</h2>
                        <Button onClick={handleImproveSummary} disabled={isImprovingSummary} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            <Wand2 className="w-4 h-4 mr-2" />
                            {isImprovingSummary ? 'Amélioration...' : 'Améliorer avec IA'}
                        </Button>
                    </div>
                  <Textarea value={cvData.summary} onChange={(e) => setCvData({ ...cvData, summary: e.target.value })} placeholder="Décrivez votre profil professionnel en quelques lignes..." className="bg-white/5 border-white/10 min-h-[120px]" />
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Expériences Professionnelles</h2>
                    <Button onClick={() => addDynamicItem('experience', { company: '', position: '', period: '', location: '', description: '' })} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
                  </div>
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input placeholder="Entreprise" value={exp.company} onChange={(e) => handleDynamicChange('experience', index, 'company', e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Poste" value={exp.position} onChange={(e) => handleDynamicChange('experience', index, 'position', e.target.value)} className="bg-white/5 border-white/10" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input placeholder="Période (ex: 2020 - 2023)" value={exp.period} onChange={(e) => handleDynamicChange('experience', index, 'period', e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Lieu" value={exp.location} onChange={(e) => handleDynamicChange('experience', index, 'location', e.target.value)} className="bg-white/5 border-white/10" />
                      </div>
                      <Textarea placeholder="Description des responsabilités..." value={exp.description} onChange={(e) => handleDynamicChange('experience', index, 'description', e.target.value)} className="bg-white/5 border-white/10" />
                      <Button onClick={() => removeDynamicItem('experience', index)} variant="destructive" size="icon" className="absolute top-2 right-2 w-7 h-7"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Formation</h2>
                    <Button onClick={() => addDynamicItem('education', { school: '', degree: '', period: '', location: '' })} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
                  </div>
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input placeholder="École/Université" value={edu.school} onChange={(e) => handleDynamicChange('education', index, 'school', e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Diplôme" value={edu.degree} onChange={(e) => handleDynamicChange('education', index, 'degree', e.target.value)} className="bg-white/5 border-white/10" />
                      </div>
                       <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input placeholder="Période" value={edu.period} onChange={(e) => handleDynamicChange('education', index, 'period', e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Lieu" value={edu.location} onChange={(e) => handleDynamicChange('education', index, 'location', e.target.value)} className="bg-white/5 border-white/10" />
                      </div>
                      <Button onClick={() => removeDynamicItem('education', index)} variant="destructive" size="icon" className="absolute top-2 right-2 w-7 h-7"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Compétences</h2>
                    <Button onClick={() => addDynamicItem('skills', { category: '', technologies: '' })} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
                  </div>
                  {cvData.skills.map((skill, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                        <Label className="text-xs text-gray-400">Compétence Globale</Label>
                        <Input placeholder="Ex: Ordonnancement, Cloud, Base de données" value={skill.category} onChange={(e) => handleDynamicChange('skills', index, 'category', e.target.value)} className="bg-white/5 border-white/10 mb-2" />
                        <Label className="text-xs text-gray-400">Technologies (séparées par une virgule)</Label>
                        <Input placeholder="Ex: VTOM, Control M, AWS, Azure, Oracle" value={skill.technologies} onChange={(e) => handleDynamicChange('skills', index, 'technologies', e.target.value)} className="bg-white/5 border-white/10" />
                        <Button onClick={() => removeDynamicItem('skills', index)} variant="destructive" size="icon" className="absolute top-2 right-2 w-7 h-7"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                
                <div className="glass-effect p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Langues</h2>
                    <Button onClick={() => addDynamicItem('languages', { language: '', level: 'Courant (C1/C2)' })} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
                  </div>
                  {(cvData.languages || []).map((lang, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Langue (ex: Anglais)" value={lang.language} onChange={(e) => handleDynamicChange('languages', index, 'language', e.target.value)} className="bg-white/5 border-white/10" />
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
                      <Button onClick={() => removeDynamicItem('languages', index)} variant="destructive" size="icon" className="absolute top-2 right-2 w-7 h-7"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Certifications</h2>
                    <Button onClick={() => addDynamicItem('certifications', { name: '', issuer: '', date: '' })} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
                  </div>
                  {(cvData.certifications || []).map((cert, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg relative">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input placeholder="Nom de la certification" value={cert.name} onChange={(e) => handleDynamicChange('certifications', index, 'name', e.target.value)} className="bg-white/5 border-white/10" />
                        <Input placeholder="Organisme de délivrance" value={cert.issuer} onChange={(e) => handleDynamicChange('certifications', index, 'issuer', e.target.value)} className="bg-white/5 border-white/10" />
                      </div>
                      <Input placeholder="Date d'obtention" value={cert.date} onChange={(e) => handleDynamicChange('certifications', index, 'date', e.target.value)} className="bg-white/5 border-white/10" />
                      <Button onClick={() => removeDynamicItem('certifications', index)} variant="destructive" size="icon" className="absolute top-2 right-2 w-7 h-7"><Trash2 className="w-4 h-4" /></Button>
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