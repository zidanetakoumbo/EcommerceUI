import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LivreDetailComponent } from './livre-detail/livre-detail.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { AdminListLivresComponent } from './admin/admin-list-livres/admin-list-livres.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminAddLivreComponent } from './admin/admin-add-livre/admin-add-livre.component';
import { AdminListAutheursComponent } from './admin/admin-list-autheurs/admin-list-autheurs.component';
import { AdminAddAutheurComponent } from './admin/admin-add-autheur/admin-add-autheur.component';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';

// Guards : fonctions qui vérifient si l'utilisateur peut accéder à une route
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // ---- Routes publiques (pas besoin d'être connecté) ----
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'catalogue', component: CatalogueComponent },
  { path: 'livreDetails/:id', component: LivreDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: InscriptionComponent },
  { path: 'recommendations', component: RecommendationsComponent },

  // ---- Routes privées (connexion requise) ----
  // canActivate: [authGuard] → Angular appelle authGuard() avant d'afficher la page.
  // loadComponent (lazy loading) : le composant n'est chargé que quand on visite la route,
  // ce qui améliore les performances au démarrage.
  {
    path: 'panier',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./panier/panier.component').then((m) => m.PanierComponent),
  },
  {
    path: 'mes-commandes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./mes-commandes/mes-commandes.component').then((m) => m.MesCommandesComponent),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profil/profil.component').then((m) => m.ProfilComponent),
  },

  // ---- Routes admin (connexion + rôle ADMIN requis) ----
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      // Gestion des livres
      { path: 'livres/list', component: AdminListLivresComponent },
      { path: 'livres/add', component: AdminAddLivreComponent },
      { path: 'livres/update/:id', component: AdminAddLivreComponent },
      // Gestion des auteurs
      { path: 'autheurs/list', component: AdminListAutheursComponent },
      { path: 'autheurs/add', component: AdminAddAutheurComponent },
      { path: 'autheurs/update/:id', component: AdminAddAutheurComponent },
      // Gestion des catégories (liste + ajout — pas de delete/edit côté backend)
      { path: 'categories', component: AdminCategoriesComponent },
      // Gestion des commandes (lazy loading car moins fréquemment consulté)
      {
        path: 'commandes',
        loadComponent: () =>
          import('./admin/admin-commandes/admin-commandes.component').then(
            (m) => m.AdminCommandesComponent
          ),
      },
    ],
  },

  // Toute URL inconnue → page d'accueil
  { path: '**', redirectTo: '/home' },
];
