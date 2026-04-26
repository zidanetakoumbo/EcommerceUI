import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  userName : string |undefined |  null; 
  userEmail : string | undefined | null ; 
  

  constructor(private auth : AuthService){
    if(auth.getEmail() ){
      this.userEmail = auth.getEmail() 
      this.userName = auth.getUserName()
    }


  }

}
