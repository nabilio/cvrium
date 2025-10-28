import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import CallToAction from '@/components/CallToAction';

const LandingPage = ({ user }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center justify-center"
      >
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500 shadow-lg flex items-center justify-center text-white text-2xl font-extrabold tracking-widest">
          NR
        </div>
      </motion.div>

      <motion.main
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="text-center z-10"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="gradient-text animate-gradient">CV Generator Pro</span>
        </motion.h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
          Créez des CV modernes et percutants en quelques minutes. Optimisés par l'IA pour correspondre parfaitement à chaque offre d'emploi.
        </p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {user ? (
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
              <Link to="/dashboard">
                <LogIn className="mr-2 h-5 w-5" /> Aller au Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg w-full sm:w-auto">
                <Link to="/login">
                  <LogIn className="mr-2 h-5 w-5" /> Se Connecter
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/register">
                  <UserPlus className="mr-2 h-5 w-5" /> S'inscrire
                </Link>
              </Button>
            </>
          )}
        </motion.div>
      </motion.main>
      
      <CallToAction />
    </div>
  );
};

export default LandingPage;