import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Download, Edit, ArrowLeft, Brain, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { CV_TEMPLATE_LIST, CV_TEMPLATE_MAP } from '@/components/cv-templates';

const CVPreview = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [cvData, setCvData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  useEffect(() => {
    if (id && id !== 'new') {
      const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
      const cv = cvs.find(c => c.id === id);
      if (cv) {
        setCvData({
          ...cv,
          personalInfo: {
            ...(cv.personalInfo || {}),
            photoUrl: cv.personalInfo?.photoUrl || '',
          },
          languages: cv.languages || [],
          certifications: cv.certifications || [],
        });
        setSelectedTemplate(cv.templateId || 'modern');
      }
    }
  }, [id, user.id]);

  const handleDownload = () => {
    toast({
      title: '🚧 Téléchargement PDF',
      description: 'Cette fonctionnalité nécessite une bibliothèque PDF. Vous pouvez la demander dans votre prochain prompt ! 🚀',
    });
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setCvData(prev => (prev ? { ...prev, templateId } : prev));

    if (id && id !== 'new') {
      const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
      const updatedCvs = cvs.map(cv =>
        cv.id === id
          ? {
              ...cv,
              templateId,
              updatedAt: new Date().toISOString(),
            }
          : cv
      );
      localStorage.setItem(`cvs_${user.id}`, JSON.stringify(updatedCvs));
    }

    toast({
      title: 'Template mis à jour',
      description: 'Votre CV utilise maintenant un nouveau modèle.',
    });
  };

  if (!cvData) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="text-center py-20">
          <p className="text-gray-400">Chargement du CV...</p>
        </div>
      </DashboardLayout>
    );
  }

  const TemplateComponent = CV_TEMPLATE_MAP[selectedTemplate] || CV_TEMPLATE_MAP.modern;
  const templateName = CV_TEMPLATE_LIST.find(t => t.id === selectedTemplate)?.name || 'Moderne';

  return (
    <>
      <Helmet>
        <title>Aperçu CV - {cvData.title}</title>
        <meta name="description" content={`Aperçu du CV: ${cvData.title}`} />
      </Helmet>
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">{cvData.title || 'Mon CV'}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <p className="text-gray-400">Aperçu de votre CV ({templateName})</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                      cvData.status === 'draft'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}
                  >
                    {cvData.status === 'draft' ? 'Brouillon' : 'Publié'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(`/ai-optimizer/${id}`)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Brain className="w-4 h-4 mr-2" /> Optimiser avec IA
              </Button>
              <Button
                onClick={() => navigate(`/cv/edit/${id}`)}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <Edit className="w-4 h-4 mr-2" /> Modifier
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4 mr-2" /> Télécharger PDF
              </Button>
            </div>
          </div>

          <div className="glass-effect p-5 rounded-2xl mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-purple-300" />
                <div>
                  <p className="text-sm text-gray-300">Changer de template</p>
                  <p className="text-xs text-gray-500">Essayez différents styles pour trouver celui qui vous ressemble.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {CV_TEMPLATE_LIST.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      selectedTemplate === template.id
                        ? 'bg-purple-500/20 text-purple-200 border-purple-400'
                        : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            key={selectedTemplate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
          >
            <TemplateComponent cv={cvData} />
          </motion.div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default CVPreview;
