import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate, useParams } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Download, Edit, ArrowLeft, Brain, User as UserIcon } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import DashboardLayout from '@/components/DashboardLayout';

    const CVPreview = ({ user, onLogout }) => {
      const navigate = useNavigate();
      const { id } = useParams();
      const { toast } = useToast();
      const [cvData, setCvData] = useState(null);

      useEffect(() => {
        if (id && id !== 'new') {
          const cvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
          const cv = cvs.find(c => c.id === id);
          if (cv) {
            setCvData(prevData => ({
                ...prevData,
                ...cv,
                personalInfo: {
                  ...(cv.personalInfo || {}),
                  photoUrl: cv.personalInfo?.photoUrl || '',
                },
                languages: cv.languages || [],
                certifications: cv.certifications || [],
            }));
          }
        }
      }, [id, user.id]);

      const handleDownload = () => {
        toast({
          title: "🚧 Téléchargement PDF",
          description: "Cette fonctionnalité nécessite une bibliothèque PDF. Vous pouvez la demander dans votre prochain prompt ! 🚀",
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
      
      const photoUrl = cvData.personalInfo.photoUrl;

      return (
        <>
          <Helmet>
            <title>Aperçu CV - {cvData.title}</title>
            <meta name="description" content={`Aperçu du CV: ${cvData.title}`} />
          </Helmet>
          <DashboardLayout user={user} onLogout={onLogout}>
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold gradient-text">{cvData.title}</h1>
                    <p className="text-gray-400">Aperçu de votre CV</p>
                  </div>
                </div>
                <div className="flex gap-3">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cv-preview p-12 rounded-2xl shadow-2xl"
              >
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-purple-600">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">{cvData.title || 'Titre du CV'}</h2>
                    {!cvData.isAnonymous ? (
                      <>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                          {cvData.personalInfo.fullName || 'Nom Complet'}
                        </h1>
                        <div className="text-gray-600 space-y-1">
                          {cvData.personalInfo.email && <p>{cvData.personalInfo.email}</p>}
                          {cvData.personalInfo.phone && <p>{cvData.personalInfo.phone}</p>}
                          {cvData.personalInfo.address && <p>{cvData.personalInfo.address}</p>}
                        </div>
                      </>
                    ) : (
                      <>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Candidat Anonyme</h1>
                        <p className="text-gray-600">Professionnel expérimenté</p>
                      </>
                    )}
                  </div>
                  {!cvData.isAnonymous && (
                    <div className="ml-8">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profil" className="w-40 h-40 rounded-full object-cover border-4 border-purple-200" />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-purple-200">
                          <UserIcon className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {cvData.summary && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Résumé Professionnel</h2>
                    <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
                  </div>
                )}

                {cvData.experience.length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Expérience Professionnelle</h2>
                    {cvData.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                            <p className="text-purple-600 font-semibold">{exp.company}</p>
                          </div>
                          <span className="text-gray-600 text-sm">{exp.period}</span>
                        </div>
                        <p className="text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {cvData.education.length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Formation</h2>
                    {cvData.education.map((edu, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                            <p className="text-purple-600">{edu.school}</p>
                          </div>
                          <span className="text-gray-600 text-sm">{edu.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cvData.skills.length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Compétences</h2>
                    <div className="space-y-3">
                    {cvData.skills.map((skill, index) => (
                      <div key={index}>
                        <h3 className="text-md font-bold text-gray-900">{skill.category}</h3>
                        <p className="text-gray-700">{skill.technologies}</p>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {(cvData.languages || []).length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Langues</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(cvData.languages).map((lang, index) => (
                      <div key={index}>
                        <p className="text-gray-900 font-semibold">{lang.language}</p>
                        <p className="text-gray-600">{lang.level}</p>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {(cvData.certifications || []).length > 0 && (
                  <div className="cv-section">
                    <h2 className="cv-section-title">Certifications</h2>
                    <div className="space-y-3">
                    {(cvData.certifications).map((cert, index) => (
                      <div key={index}>
                        <h3 className="text-md font-bold text-gray-900">{cert.name}</h3>
                        <p className="text-gray-700 italic">{cert.issuer} - {cert.date}</p>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
                
              </motion.div>
            </div>
          </DashboardLayout>
        </>
      );
    };

    export default CVPreview;