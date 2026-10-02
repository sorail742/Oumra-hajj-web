/**
 * Erreurs globales d'un formulaire (réponse de l'API non rattachée à un
 * champ), annoncées aux lecteurs d'écran. Rien n'est rendu sans message.
 */
export function FormErrorBanner({
  messages,
}: Readonly<{ messages: readonly string[] }>) {
  if (messages.length === 0) {
    return null;
  }
  return (
    <div
      role="alert"
      className="bg-state-danger-bg text-state-danger space-y-1 rounded-md px-3 py-2 text-sm"
    >
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
