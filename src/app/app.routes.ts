import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LivreDetailComponent } from './livre-detail/livre-detail.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { InscriptionComponent } from './inscription/inscription.component';

export const routes: Routes = [

    { path : 'home', component : HomeComponent},
    { path : '', redirectTo : '/home', pathMatch : 'full'},
    { path : 'livreDetails/:id', component : LivreDetailComponent},
    { path : 'catalogue', component : CatalogueComponent},
    { path : 'admin', component : AdminComponent},
    { path : 'login', component : LoginComponent},
    { path : 'register', component : InscriptionComponent},
    
];
