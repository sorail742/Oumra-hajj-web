const { execSync } = require('child_process');

const issues = [
  {
    title: "[Phase 0] Infrastructure Front-end & Outillage",
    body: "Mise en place des fondations du projet Oumra & Hadj.\n\n### Sous-tâches\n- [ ] Initialisation Next.js 15 (App Router)\n- [ ] Configuration Tailwind CSS v4 & shadcn/ui\n- [ ] Mise en place du Linter (ESLint, Prettier, Husky)\n- [ ] Configuration i18n (next-intl)\n- [ ] Scripts CI/CD (GitHub Actions pour le build et lint)",
  },
  {
    title: "[Phase 2] Domaine : Groupes, SOS & Messagerie",
    body: "Communication et sécurité pendant le voyage.\n\n### Sous-tâches\n- [ ] Affichage de la composition des groupes\n- [ ] Fonctionnalité Alerte SOS (Pèlerin vers Guide/Agence)\n- [ ] Messagerie instantanée avec l'agence ou le guide",
  },
  {
    title: "[Phase 2] Domaine : Calendrier Agence",
    body: "Synchronisation externe des événements.\n\n### Sous-tâches\n- [ ] Affichage du lien d'abonnement ICS pour l'agence\n- [ ] Action pour copier le lien\n- [ ] Fonctionnalité de régénération du token (avec avertissement)",
  },
  {
    title: "[Phase 3] Infrastructure de Production (Infra)",
    body: "Déploiement final et monitoring.\n\n### Sous-tâches\n- [ ] Configuration du déploiement (Vercel ou Dockerfile)\n- [ ] Sécurisation des Variables d'environnement de Production\n- [ ] Intégration du Monitoring & Logs (Sentry)\n- [ ] Analytics d'usage (PostHog)\n- [ ] Tests End-to-End critiques (Playwright)",
  }
];

console.log("Création des issues manquantes...");

for (const issue of issues) {
  try {
    const cmd = `gh issue create --title "${issue.title}" --body "${issue.body}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Issue créée : ${issue.title}`);
  } catch (err) {
    console.error(`Erreur lors de la création de l'issue : ${issue.title}`);
  }
}

console.log("Terminé !");

