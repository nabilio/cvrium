import React from 'react';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-gray-500">{title}</h2>
    <div className="space-y-3 text-sm text-gray-700">{children}</div>
  </section>
);

const MinimalTemplate = ({ cv }) => {
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
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
      <header className="px-10 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-semibold tracking-tight">{fullName}</h1>
        <p className="text-gray-500 mt-1">{roleTitle}</p>
      </header>

      <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-10 p-10">
        <div className="space-y-8">
          {summary && (
            <Section title="Résumé">
              <p className="leading-relaxed">{summary}</p>
            </Section>
          )}

          {(experience || []).length > 0 && (
            <Section title="Expérience">
              {experience.map((exp, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{exp.position}</p>
                      <p className="text-gray-500 text-xs uppercase tracking-widest">{exp.company}</p>
                    </div>
                    <p className="text-xs text-gray-400">{exp.period}</p>
                  </div>
                  <p className="text-xs text-gray-400">{exp.location}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {(education || []).length > 0 && (
            <Section title="Formation">
              {education.map((edu, index) => (
                <div key={index} className="space-y-1">
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{edu.school}</p>
                  <p className="text-xs text-gray-400">{edu.period}</p>
                </div>
              ))}
            </Section>
          )}
        </div>

        <div className="space-y-8">
          <Section title="Contact">
            <div className="space-y-2">
              {!isAnonymous && personalInfo.email && <p>{personalInfo.email}</p>}
              {!isAnonymous && personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.address && <p>{personalInfo.address}</p>}
              {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
              {personalInfo.website && <p>{personalInfo.website}</p>}
            </div>
          </Section>

          {(skills || []).length > 0 && (
            <Section title="Compétences">
              <ul className="space-y-2">
                {skills.map((skill, index) => (
                  <li key={index}>
                    <p className="font-medium text-sm">{skill.category}</p>
                    <p className="text-xs text-gray-500">{skill.technologies}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(languages || []).length > 0 && (
            <Section title="Langues">
              <ul className="space-y-2">
                {languages.map((lang, index) => (
                  <li key={index} className="flex justify-between text-xs">
                    <span>{lang.language}</span>
                    <span className="text-gray-500">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(certifications || []).length > 0 && (
            <Section title="Certifications">
              <ul className="space-y-2">
                {certifications.map((cert, index) => (
                  <li key={index}>
                    <p className="font-medium text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500">{cert.issuer} • {cert.date}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
