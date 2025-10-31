import React from 'react';

const Bullet = ({ children }) => (
  <li className="flex gap-3">
    <span className="mt-1 block h-2 w-2 rounded-full bg-emerald-400" />
    <span className="text-sm text-slate-700 leading-relaxed">{children}</span>
  </li>
);

const ElegantTemplate = ({ cv }) => {
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
    <div className="bg-slate-50 text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-12 py-10">
        <p className="uppercase tracking-[0.4em] text-white/70 text-xs">{roleTitle}</p>
        <h1 className="text-4xl font-semibold mt-2">{fullName}</h1>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {!isAnonymous && personalInfo.email && <span>{personalInfo.email}</span>}
          {!isAnonymous && personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>
      </div>

      <div className="px-12 py-10 space-y-10">
        {summary && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Profil</h2>
            <p className="text-slate-700 leading-relaxed text-sm">{summary}</p>
          </section>
        )}

        {(experience || []).length > 0 && (
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Expérience</h2>
            {experience.map((exp, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold">{exp.position}</p>
                    <p className="text-sm text-emerald-600 font-medium">{exp.company}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 md:mt-0">{exp.period}</p>
                </div>
                {exp.location && <p className="text-xs text-slate-400 mt-1">{exp.location}</p>}
                {exp.description && (
                  <ul className="mt-4 space-y-2">
                    {exp.description.split('\n').map((line, lineIndex) => (
                      line.trim() ? <Bullet key={lineIndex}>{line.trim()}</Bullet> : null
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {(education || []).length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Formation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {education.map((edu, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <p className="font-semibold text-sm">{edu.degree}</p>
                  <p className="text-sm text-emerald-600">{edu.school}</p>
                  <p className="text-xs text-slate-500 mt-1">{edu.period}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {(skills || []).length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Compétences</h2>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                    <p className="font-semibold text-sm text-slate-900">{skill.category}</p>
                    <p className="text-xs text-slate-500 mt-1">{skill.technologies}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-6">
            {(languages || []).length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Langues</h2>
                <ul className="space-y-2">
                  {languages.map((lang, index) => (
                    <li key={index} className="flex justify-between bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs">
                      <span className="font-medium text-slate-700">{lang.language}</span>
                      <span className="text-slate-500">{lang.level}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(certifications || []).length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-emerald-600 tracking-wide">Certifications</h2>
                <ul className="space-y-2">
                  {certifications.map((cert, index) => (
                    <li key={index} className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs">
                      <p className="font-medium text-slate-800">{cert.name}</p>
                      <p className="text-slate-500 mt-1">{cert.issuer} • {cert.date}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantTemplate;
