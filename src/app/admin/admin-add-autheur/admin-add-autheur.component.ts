import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutheurService } from '../../services/autheur/autheur.service';
import { Autheur } from '../../Modeles/autheur.model';

@Component({
  selector: 'app-admin-add-autheur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-add-autheur.component.html',
  styleUrls: ['./admin-add-autheur.component.css'],
})
export class AdminAddAutheurComponent implements OnInit {
  autheurForm!: FormGroup;
  isEditMode = false;
  autheurId?: number;

  constructor(
    private fb: FormBuilder,
    private autheurService: AutheurService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.autheurId = this.route.snapshot.params['id'];
    if (this.autheurId) {
      this.isEditMode = true;
      this.loadAutheur(this.autheurId);
    }
  }

  initForm(): void {
    this.autheurForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  loadAutheur(id: number): void {
    this.autheurService.getAutheurById(id).subscribe({
      next: (autheur) => {
        this.autheurForm.patchValue(autheur);
      },
      error: (err) => {
        console.error('Impossible de charger l\'auteur', err);
      },
    });
  }

  onSubmit(): void {
    if (this.autheurForm.invalid) {
      return;
    }

    const autheurData: Autheur = {
      ...this.autheurForm.value,
      id: this.autheurId,
    };

    if (this.isEditMode && this.autheurId) {
      this.autheurService.updateAutheur(this.autheurId, autheurData).subscribe({
        next: () => this.router.navigate(['/admin/autheurs/list']),
        error: (err) => console.error('Erreur mise à jour auteur', err),
      });
    } else {
      this.autheurService.createAutheur(autheurData).subscribe({
        next: () => this.router.navigate(['/admin/autheurs/list']),
        error: (err) => console.error('Erreur création auteur', err),
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/autheurs/list']);
  }
}
