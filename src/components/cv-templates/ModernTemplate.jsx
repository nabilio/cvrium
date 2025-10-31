import React from 'react';

const ModernTemplate = ({ cv }) => {
  const {
    title,
    isAnonymous,
    personalInfo = {},
    summary,
    experience = [],
    education = [],
    skills = [],
    languages = [],
    certifications = [],
  } = cv || {};

  const fullName = isAnonymous ? 'Candidat Anonyme' : (personalInfo.fullName || 'Nom Complet');
  const roleTitle = title || 'Titre du CV';

  return (
    <div className="grid md:grid-cols-[280px,1fr] bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      <aside className="bg-gradient-to-b from-purple-600 to-indigo-600 text-white p-8 space-y-6">
        <div className="text-center space-y-2">
          {!isAnonymous && personalInfo.photoUrl ? (
            <img
              src={personalInfo.photoUrl}
              alt="Profil"
              className="w-32 h-32 rounded-full border-4 border-white/40 object-cover mx-auto"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white/40 mx-auto flex items-center justify-center text-2xl font-bold">
              {fullName.slice(0, 1)}
            </div>
          )}
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-white/80 text-sm">{roleTitle}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">Contact</h2>
          <div className="space-y-2 text-sm">
            {personalInfo.email && <p className="font-medium">{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.address && <p>{personalInfo.address}</p>}
            {personalInfo.linkedin && <p className="break-words">{personalInfo.linkedin}</p>}
            {personalInfo.website && <p className="break-words">{personalInfo.website}</p>}
          </div>
        </div>

        {(skills || []).length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/60 mb-3">Compétences clés</h2>
            <div className="space-y-3 text-sm">
              {skills.map((skill, index) => (
                <div key={index}>
                  <p className="font-semibold">{skill.category}</p>
                  <p className="text-white/70">{skill.technologies}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(languages || []).length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/60 mb-3">Langues</h2>
            <ul className="space-y-1 text-sm">
              {languages.map((lang, index) => (
                <li key={index} className="flex justify-between">
                  <span>{lang.language}</span>
                  <span className="text-white/70">{lang.level}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(certifications || []).length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/60 mb-3">Certifications</h2>
            <ul className="space-y-2 text-sm">
              {certifications.map((cert, index) => (
                <li key={index}>
                  <p className="font-semibold">{cert.name}</p>
                  <p className="text-white/70 text-xs">{cert.issuer} • {cert.date}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className="p-10 space-y-8">
        {summary && (
          <section>
            <h2 className="text-xl font-semibold text-purple-600 uppercase tracking-wide mb-4">
              Profil professionnel
            </h2>
            <p className="leading-relaxed text-gray-700">{summary}</p>
          </section>
        )}

        {(experience || []).length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-purple-600 uppercase tracking-wide">
              Expérience professionnelle
            </h2>
            {experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-purple-200 pl-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <p className="text-purple-500 font-medium">{exp.company}</p>
                  </div>
                  <p className="text-sm text-gray-500">{exp.period}</p>
                </div>
                <p className="text-sm text-gray-600">{exp.location}</p>
                <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {(education || []).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-600 uppercase tracking-wide">
              Formation
            </h2>
            {education.map((edu, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{edu.degree}</h3>
                  <p className="text-purple-500 font-medium">{edu.school}</p>
                </div>
                <p className="text-sm text-gray-500">{edu.period}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default ModernTemplate;
