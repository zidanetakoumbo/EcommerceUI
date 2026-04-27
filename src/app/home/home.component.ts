import { Component, computed, inject, Signal } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  userName : Signal<string | null>
  userEmail : Signal<string | null >
  isLogged : Signal<boolean> ; 

  private auth = inject(AuthService); 

  constructor(){

    // la valeur initiale est obligatoire , par defaut on met a false
    // l'utilisation oblige d'utiliser les () coté html
    this.isLogged = toSignal(this.auth.isLoggedIn$, {initialValue : false }); 

    // 2. Des signaux dérivés : ils se recalculent dès que isLogged() change
    this.userName = computed(() => this.isLogged() ? this.auth.getUserName() : null);
    this.userEmail = computed(() => this.isLogged() ? this.auth.getEmail() : null);

    console.log("storage username ="+localStorage.getItem("username"));
    console.log(" username ="+this.userName);

  }

}
