import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, Mail, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const RecommendationsPage = ({ user, onLogout }) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    colleagueName: '',
    colleagueEmail: '',
    message: '',
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`recommendations_${user.id}`) || '[]');
    setRecommendations(stored);
  }, [user.id]);

  const handleRequestRecommendation = () => {
    const newRecommendation = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const updated = [...recommendations, newRecommendation];
    setRecommendations(updated);
    localStorage.setItem(`recommendations_${user.id}`, JSON.stringify(updated));

    toast({
      title: "Demande envoyée ! 📧",
      description: `Une demande de recommandation a été envoyée à ${formData.colleagueName}`,
    });

    setFormData({ colleagueName: '', colleagueEmail: '', message: '' });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Recommandations - CV Generator Pro</title>
        <meta name="description" content="Gérez vos demandes de recommandations professionnelles" />
      </Helmet>
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Recommandations</h1>
            <p className="text-gray-400">Demandez des recommandations à vos collègues</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">Demander une recommandation</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Envoyez une demande de recommandation à un collègue
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="colleagueName">Nom du collègue</Label>
                  <Input
                    id="colleagueName"
                    value={formData.colleagueName}
                    onChange={(e) => setFormData({ ...formData, colleagueName: e.target.value })}
                    placeholder="Jean Dupont"
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="colleagueEmail">Email du collègue</Label>
                  <Input
                    id="colleagueEmail"
                    type="email"
                    value={formData.colleagueEmail}
                    onChange={(e) => setFormData({ ...formData, colleagueEmail: e.target.value })}
                    placeholder="jean@example.com"
                    className="mt-2 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message personnalisé</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Bonjour, j'aimerais que tu rédiges une recommandation pour moi..."
                    className="mt-2 bg-white/5 border-white/10 min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleRequestRecommendation}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Mail className="w-4 h-4 mr-2" /> Envoyer la demande
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{rec.colleagueName}</h3>
                    <p className="text-sm text-gray-400">{rec.colleagueEmail}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  rec.status === 'pending' 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {rec.status === 'pending' ? 'En attente' : 'Reçue'}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{rec.message}</p>
              <p className="text-xs text-gray-500">
                Demandée le {new Date(rec.requestedAt).toLocaleDateString('fr-FR')}
              </p>
            </motion.div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-gray-400">Aucune recommandation</h3>
            <p className="text-gray-500 mb-6">Commencez par demander une recommandation à un collègue</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Première demande
            </Button>
          </motion.div>
        )}
      </DashboardLayout>
    </>
  );
};

export default RecommendationsPage;