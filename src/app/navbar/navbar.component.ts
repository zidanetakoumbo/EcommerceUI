import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  // On récupère juste l'observable du service
  isLoggedIn$: Observable<boolean>;

  // possible de ne pas faire un async en recuperant directement la valeur avec tosignal() devant l'obs

  constructor(private auth: AuthService) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  OnLogout() {
    this.auth.logout();
  }
}
