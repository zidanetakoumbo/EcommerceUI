import { Component } from '@angular/core';
import { AdminSidebarComponent } from "./admin-sidebar/admin-sidebar.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-admin',
  imports: [AdminSidebarComponent, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
