const { execSync } = require('child_process');

const issues = [
  {
    title: "[Phase 0] Infrastructure Front-end & Outillage",
    body: "Mise en place des fondations du projet Oumra & Hadj.\n\n### Sous-tâches\n- [ ] Initialisation Next.js 15 (App Router)\n- [ ] Configuration Tailwind CSS v4 & shadcn/ui\n- [ ] Mise en place du Linter (ESLint, Prettier, Husky)\n- [ ] Configuration i18n (next-intl)\n- [ ] Scripts CI/CD (GitHub Actions pour le build et lint)",
  },
  {
    title: "[Phase 0] Authentification & Proxy API",
    body: "Gestion sécurisée des sessions avec le backend NestJS.\n\n### Sous-tâches\n- [ ] Création du Proxy Next.js (Route Handlers `/api/...`)\n- [ ] Gestion des tokens JWT (HTTP-only cookies)\n- [ ] Implémentation du renouvellement silencieux du jeton (Refresh Token)\n- [ ] Composant HOC / Provider pour gérer les rôles (`<Can>`)",
  },
  {
    title: "[Phase 0] Accès Public & Espace Utilisateur",
    body: "Écrans d'authentification pour les différents rôles.\n\n### Sous-tâches\n- [ ] Écran de Connexion (Login Agence)\n- [ ] Connexion par OTP (Pèlerin & Guide)\n- [ ] Écran d'inscription Agence\n- [ ] Flux de mot de passe oublié",
  },
  {
    title: "[Phase 1] Composants Partagés & Design System",
    body: "Création des composants UI réutilisables selon le Design System.\n\n### Sous-tâches\n- [ ] Implémentation de `AsyncBoundary` (Squelette, Erreur, Vide)\n- [ ] Tableau de données `DataTable` avec pagination client\n- [ ] Badges de statuts `StatusBadge` centralisés\n- [ ] Registre centralisé des statuts (`status-registry.ts`)\n- [ ] En-tête de page standard `PageHeader`",
  },
  {
    title: "[Phase 2] Domaine : Validation des Agences (Admin)",
    body: "Espace administrateur pour la gestion des agences inscrites.\n\n### Sous-tâches\n- [ ] Création du tableau de bord Admin\n- [ ] Liste des agences en attente de validation\n- [ ] Action : Approuver une agence\n- [ ] Action : Rejeter une agence (avec motif)",
  },
  {
    title: "[Phase 2] Domaine : Forfaits (Packages)",
    body: "Affichage et filtrage des offres de pèlerinage.\n\n### Sous-tâches\n- [ ] Liste des forfaits disponibles\n- [ ] Recherche et filtres (Type : Oumra/Hadj, Budget maximum)\n- [ ] Affichage des prix et statuts du forfait",
  },
  {
    title: "[Phase 2] Domaine : Réservations (Bookings)",
    body: "Suivi des dossiers de réservation.\n\n### Sous-tâches\n- [ ] Liste des réservations de l'utilisateur\n- [ ] Détail du dossier de réservation\n- [ ] Suivi visuel des étapes (Paiement, Visa, Vol, Vaccin)",
  },
  {
    title: "[Phase 2] Domaine : Documents & Conformité",
    body: "Gestion documentaire pour les pèlerins et les agences.\n\n### Sous-tâches\n- [ ] Espace de dépôt de documents pèlerin (Passeport, Visa)\n- [ ] Accès sécurisé aux documents via URL signée\n- [ ] Vérification de conformité documentaire (Alertes Agences)\n- [ ] Distinguer visuellement les documents expirés / expirant bientôt",
  },
  {
    title: "[Phase 2] Domaine : Paiements",
    body: "Suivi financier des réservations.\n\n### Sous-tâches\n- [ ] Liste des tranches de paiement (Mobile Money, Carte)\n- [ ] Flux de demande de remboursement (selon statut)\n- [ ] Affichage des avertissements d'éligibilité au remboursement",
  },
  {
    title: "[Phase 2] Domaine : Avis & Score de confiance",
    body: "Système de notation et de confiance des agences.\n\n### Sous-tâches\n- [ ] Carte du Score de confiance de l'agence (`TrustScoreBadge`)\n- [ ] Dépôt d'avis pour les pèlerins post-voyage\n- [ ] Liste des avis reçus par l'agence",
  },
  {
    title: "[Phase 2] Domaine : Rites & Livret Souvenir",
    body: "Accompagnement religieux du pèlerin.\n\n### Sous-tâches\n- [ ] Fiches de rites avec bannière obligatoire `ReligiousContentNotice`\n- [ ] Checklist de progression personnelle (Tawaf, Sa'i)\n- [ ] Génération de la vue synthétique du Livret Souvenir",
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

console.log("Création de " + issues.length + " issues dans GitHub...");

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

