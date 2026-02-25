import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LivreDetailComponent } from './livre-detail/livre-detail.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [

    { path : '', component : HomeComponent},
    { path : 'livreDetails/:id', component : LivreDetailComponent},
    { path : 'catalogue', component : CatalogueComponent},
    { path : 'admin', component : AdminComponent},
    
];
