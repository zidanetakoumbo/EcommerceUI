import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { PanierService } from '../services/panier/panier.service';
import { filter, map, Observable, Subscription } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule, AsyncPipe, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Observable for login state - template subscribes with "async" pipe
  isLoggedIn$: Observable<boolean>;

  // Number of items in the cart (for the badge)
  cartCount = 0;
  private cartSub?: Subscription;

  private router = inject(Router);

  // Signal: true when NOT in the admin section (to hide the navbar there)
  showNavbar = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => !this.router.url.includes('/admin'))
    ),
    { initialValue: true }
  );

  constructor(
    private auth: AuthService,
    private panierService: PanierService
  ) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
  }

  /** Prénom de l'utilisateur connecté (affiché dans le menu) */
  get userName(): string | null {
    return this.auth.getUserName();
  }

  ngOnInit(): void {
    // Subscribe to cart count to update the navbar badge
    this.cartSub = this.panierService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });
  }

  ngOnDestroy(): void {
    // Always unsubscribe to avoid memory leaks
    this.cartSub?.unsubscribe();
  }

  /** Returns true if the logged-in user is admin (to show the Admin link) */
  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  OnLogout() {
    this.panierService.resetCartCount();
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
