import { useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CvBuilder from "./pages/CvBuilder.jsx";
import CvPreview from "./pages/CvPreview.jsx";
import Messages from "./pages/Messages.jsx";
import Network from "./pages/Network.jsx";
import Settings from "./pages/Settings.jsx";

const navLinks = [
  { href: "/app", label: "Tableau de bord" },
  { href: "/cv/new", label: "Créateur de CV" },
  { href: "/messages", label: "Messagerie" },
  { href: "/network", label: "Réseau" },
  { href: "/settings", label: "Paramètres" },
];

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cvrium-user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSignIn = (profile) => {
    localStorage.setItem("cvrium-user", JSON.stringify(profile));
    setUser(profile);
  };

  const handleSignOut = () => {
    localStorage.removeItem("cvrium-user");
    setUser(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header user={user} onSignOut={handleSignOut} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onSignIn={handleSignIn} user={user} />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv/new"
            element={
              <ProtectedRoute user={user}>
                <CvBuilder user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cv/preview/:id"
            element={
              <ProtectedRoute user={user}>
                <CvPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute user={user}>
                <Messages user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute user={user}>
                <Network user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user}>
                <Settings user={user} onSignOut={handleSignOut} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function Header({ user, onSignOut }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2]/10 text-xl font-bold text-[#0a66c2]">
            CV
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">CVrium</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Générateur de CV assisté par IA
            </p>
          </div>
        </div>

        {!isLanding && user ? (
          <nav className="hidden items-center gap-3 text-sm font-medium text-slate-600 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-full px-4 py-2 transition ${
                  location.pathname === link.href
                    ? "bg-[#0a66c2]/10 text-[#0a66c2]"
                    : "hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
                  <span className="text-xs text-slate-500">{user.title || "Membre"}</span>
                </div>
                <img
                  src={user.photo || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(user.fullName)}
                  alt={user.fullName}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
              </div>
              <button className="btn-secondary" onClick={onSignOut}>
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/" className="btn-secondary hidden sm:inline-flex">
                Découvrir CVrium
              </Link>
              <a href="#inscription" className="btn-primary">
                S'inscrire
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <p>&copy; {new Date().getFullYear()} CVrium. Une expérience inspirée de LinkedIn pour vos candidatures.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link className="link-muted" to="/settings">
            Paramètres
          </Link>
          <Link className="link-muted" to="/network">
            Réseau
          </Link>
          <Link className="link-muted" to="/messages">
            Messagerie
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default App;
