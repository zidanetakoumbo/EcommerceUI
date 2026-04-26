import { Component } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isLogged! : Boolean  

  constructor(private auth : AuthService){
    if( auth.getEmail()){
      this.isLogged = true ; 
    }
    else{
      this.isLogged = false
    }
  }

}
