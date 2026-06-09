import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {

  username : string | null 
  constructor(private authservice : AuthService, private router : Router){
    this.username = this.authservice.getUserName() ; 
  }

  logout(){
    this.authservice.logout();
    this.router.navigate(['/login'])
    
  }

}
