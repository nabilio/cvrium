import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Inès Dupont",
    headline: "Talent Acquisition @ TechBridge",
    lastMessage: "Merci pour votre CV, je vous recontacte bientôt !",
    messages: [
      {
        id: "m1",
        sender: "Inès",
        timestamp: "Hier",
        content: "Bonjour Alex, ravie d'échanger avec vous. J'ai bien reçu votre CV.",
      },
      {
        id: "m2",
        sender: "Alex",
        timestamp: "Hier",
        content: "Merci Inès, n'hésitez pas si vous avez besoin d'informations supplémentaires.",
      },
    ],
  },
  {
    id: "2",
    name: "Louis Bernard",
    headline: "Coach Carrière",
    lastMessage: "J'ai ajouté quelques suggestions IA pour ton résumé.",
    messages: [
      {
        id: "m3",
        sender: "Louis",
        timestamp: "Il y a 3 jours",
        content: "Salut Alex, j'ai relu ton brouillon et l'IA pourrait renforcer la partie leadership.",
      },
    ],
  },
];

function Messages({ user }) {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId);

  return (
    <div className="bg-[#f3f2ef] pb-16">
      <div className="page-shell">
        <aside className="page-sidebar">
          <h1 className="text-lg font-semibold text-slate-900">Messagerie</h1>
          <p className="text-sm text-slate-600">
            Les messages sont synchronisés de façon asynchrone, à la manière de LinkedIn.
          </p>
          <div className="mt-4 space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  activeId === conversation.id
                    ? "border-[#0a66c2] bg-white shadow"
                    : "border-transparent bg-white/60 hover:bg-white"
                }`}
                onClick={() => setActiveId(conversation.id)}
              >
                <p className="font-semibold text-slate-900">{conversation.name}</p>
                <p className="text-xs text-slate-500">{conversation.headline}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{conversation.lastMessage}</p>
              </button>
            ))}
          </div>
        </aside>
        <section className="page-content">
          {activeConversation ? (
            <div className="form-section">
              <header>
                <h2 className="text-lg font-semibold text-slate-900">{activeConversation.name}</h2>
                <p className="text-sm text-slate-500">{activeConversation.headline}</p>
              </header>
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                {activeConversation.messages.map((message) => (
                  <article key={message.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{message.sender}</span>
                      <span>{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-600">{message.content}</p>
                  </article>
                ))}
              </div>
              <form className="space-y-3">
                <label htmlFor="reply" className="text-sm font-medium text-slate-700">
                  Répondre (envoi différé)
                </label>
                <textarea id="reply" rows={3} placeholder="Rédigez votre réponse..." />
                <button className="btn-primary w-fit" type="button">
                  Planifier l'envoi
                </button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sélectionnez une conversation pour afficher les messages.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;
