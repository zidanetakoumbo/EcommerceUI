import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.isLoading = true;
    this.error = '';

    // Step 1: login -> receive the JWT token
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // Save token and basic info in localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('userName', res.userName);
        localStorage.setItem('email', res.email);

        // Notify all components that the user is now logged in
        this.authService.setLoggedIn(true);

        // Step 2: fetch profile to know the role (admin or not)
        // fetchProfil() saves isAdmin to localStorage
        this.authService.fetchProfil().subscribe({
          next: () => {
            this.isLoading = false;
            // Redirect based on role
            if (this.authService.isAdmin()) {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: () => {
            // If profile fetch fails, still redirect to home
            // (user is logged in, just not admin)
            this.isLoading = false;
            this.router.navigate(['/home']);
          },
        });
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Identifiants invalides ou utilisateur inexistant';
      },
    });
  }
}
