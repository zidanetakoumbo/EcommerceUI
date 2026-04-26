import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css',
})
export class InscriptionComponent {
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  datenaissance = '';
  adresse = '';
  nom = '';
  prenom = '';
  error = '';

  constructor(private http: HttpClient) { }

  AllFieldsOk() {
    this.message = '';
    this.error = '';

    if (
      !this.email ||
      !this.password ||
      !this.nom ||
      !this.prenom ||
      !this.confirmPassword ||
      !this.datenaissance
    ) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }
  }

  register() {
    // on teste si tous les champs sont ok
    this.AllFieldsOk();

    const user = {
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      adresse : this.adresse ,
      datenaissance: this.datenaissance,
    };

    this.http.post('http://localhost:8080/api/user/register', user).subscribe({
      next: () => {
        this.message = 'Inscription réussie';
        console.log(this.message)
        console.log(user)
      },
      error: (err) => {
        this.error = 'Erreur inscription : certains champs sont vides ou les mdp ne correspondent pas ';
        console.log(err);
      },
    });
  }
}
