import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Plus, FileText, LogOut, Sparkles, Eye, Edit, Trash2, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cvs, setCvs] = useState([]);

  useEffect(() => {
    const storedCvs = JSON.parse(localStorage.getItem(`cvs_${user.id}`) || '[]');
    setCvs(storedCvs);
  }, [user.id]);

  const handleDeleteCV = (cvId) => {
    const updatedCvs = cvs.filter(cv => cv.id !== cvId);
    setCvs(updatedCvs);
    localStorage.setItem(`cvs_${user.id}`, JSON.stringify(updatedCvs));
    toast({
      title: "CV supprimé",
      description: "Le CV a été supprimé avec succès",
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - CV Generator Pro</title>
        <meta name="description" content="Gérez tous vos CV professionnels" />
      </Helmet>
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Mes CV</h1>
          <p className="text-gray-400">Gérez toutes vos versions de CV</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/cv/new')}
            className="glass-effect p-8 rounded-2xl border-2 border-dashed border-purple-500/50 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center min-h-[300px] group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Créer un nouveau CV</h3>
            <p className="text-gray-400 text-center">Commencez avec un template moderne</p>
          </motion.div>

          {cvs.map((cv, index) => (
            <motion.div
              key={cv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-6 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{cv.title}</h3>
                  <p className="text-sm text-gray-400">
                    Modifié le {new Date(cv.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {cv.language === 'fr' && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Français
                  </span>
                )}
                {cv.language === 'en' && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" /> English
                  </span>
                )}
                {cv.isAnonymous && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Anonyme
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/cv/preview/${cv.id}`)}
                  className="flex-1 border-white/20 hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 mr-1" /> Voir
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/cv/edit/${cv.id}`)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Edit className="w-4 h-4 mr-1" /> Modifier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteCV(cv.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {cvs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-gray-400">Aucun CV pour le moment</h3>
            <p className="text-gray-500 mb-6">Créez votre premier CV pour commencer</p>
            <Button
              onClick={() => navigate('/cv/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Créer mon premier CV
            </Button>
          </motion.div>
        )}
      </DashboardLayout>
    </>
  );
};

export default Dashboard;