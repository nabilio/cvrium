import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Brain, ArrowLeft, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { callOpenAI } from "@/lib/openai";
import { parseAIJson } from "@/lib/aiJson";

const AIOptimizer = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [cvData, setCvData] = useState(null);
  const [jobOffer, setJobOffer] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    if (id) {
      const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || "[]");
      const cv = cvs.find((c) => c.id === id);
      if (cv) {
        setCvData(cv);
      }
    }
  }, [id, user.id]);

  const handleOptimize = async () => {
    if (!jobOffer.trim() || !cvData) {
      toast({
        title: "Données manquantes",
        description:
          "Veuillez coller l'offre d'emploi et vous assurer que le CV est chargé.",
        variant: "destructive",
      });
      return;
    }

    setOptimizing(true);
    setSuggestions(null);
    toast({
      title: "Optimisation IA en cours...",
      description: "L'IA analyse votre CV et l'offre d'emploi.",
    });

    try {
      const cvContent = JSON.stringify(cvData);
      const prompt = `En te basant sur ce CV: ${cvContent} et cette offre d'emploi: "${jobOffer}", fournis des suggestions d'amélioration pour le CV. Retourne un objet JSON avec la structure : { "summary": "...", "skills": ["...", "..."], "experience": ["...", "..."], "keywords": ["...", "..."] }. Ne retourne que le JSON.`;

      const result = await callOpenAI(prompt);
      const parsedResult = parseAIJson(result);
      setSuggestions(parsedResult);

      toast({
        title: "Analyse terminée ! 🎉",
        description: "Voici les suggestions de l'IA pour votre CV.",
      });
    } catch (error) {
      console.error("Erreur d'API OpenAI:", error);
      toast({
        title: "Oups ! Une erreur est survenue.",
        description:
          error?.message === "AI_JSON_PARSE_ERROR"
            ? "La réponse de l'IA n'était pas un JSON valide. Réessayez avec un texte plus ciblé."
            : "Vérifiez votre clé API ou réessayez. Si le problème persiste, le service OpenAI est peut-être indisponible.",
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplySuggestions = () => {
    toast({
      title: "🚧 Fonctionnalité en cours de développement",
      description:
        "L'application automatique des suggestions arrive bientôt ! Pour l'instant, vous pouvez les appliquer manuellement. 🚀",
    });
  };

  if (!cvData) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="text-center py-20">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Optimisation IA - {cvData.title}</title>
        <meta
          name="description"
          content="Optimisez votre CV avec l'intelligence artificielle"
        />
      </Helmet>
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Button
              onClick={() => navigate(`/cv/preview/${id}`)}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <Brain className="w-10 h-10" /> Optimisation IA
              </h1>
              <p className="text-gray-400">
                Adaptez votre CV à une offre d'emploi spécifique
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-effect p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" /> Offre d'emploi
              </h2>
              <Label htmlFor="jobOffer" className="mb-2 block">
                Collez l'offre d'emploi complète
              </Label>
              <Textarea
                id="jobOffer"
                value={jobOffer}
                onChange={(e) => setJobOffer(e.target.value)}
                placeholder="Collez ici la description complète de l'offre d'emploi..."
                className="bg-white/5 border-white/10 min-h-[400px] mb-4"
              />
              <Button
                onClick={handleOptimize}
                disabled={optimizing}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {optimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" /> Analyser avec l'IA
                  </>
                )}
              </Button>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" /> Suggestions
                d'optimisation
              </h2>
              {!suggestions && !optimizing ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Collez une offre d'emploi et cliquez sur "Analyser" pour
                    recevoir des suggestions personnalisées.
                  </p>
                </div>
              ) : null}
              {optimizing ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-gray-400">L'IA réfléchit...</p>
                </div>
              ) : null}
              {suggestions ? (
                <div className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-400 mb-2">
                      📝 Résumé
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {suggestions.summary}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-400 mb-2">
                      💡 Compétences
                    </h3>
                    <ul className="space-y-2">
                      {suggestions.skills.map((skill, index) => (
                        <li
                          key={index}
                          className="text-gray-300 text-sm flex items-start gap-2"
                        >
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-400 mb-2">
                      🎯 Expérience
                    </h3>
                    <ul className="space-y-2">
                      {suggestions.experience.map((exp, index) => (
                        <li
                          key={index}
                          className="text-gray-300 text-sm flex items-start gap-2"
                        >
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-400 mb-2">
                      🔑 Mots-clés importants
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleApplySuggestions}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Appliquer les
                    suggestions
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AIOptimizer;
