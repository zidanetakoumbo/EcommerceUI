import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  imports: [CommonModule],
  styleUrl: './catalogue.component.css'
})
export class CatalogueComponent {

  books = [
  { image: '/images/livre.jpg', name: 'Livre 1' },
  { image: '/images/livre.jpg', name: 'Livre 2' },
  { image: '/images/livre.jpg', name: 'Livre 3' },
  { image: '/images/livre.jpg', name: 'Livre 4' },
];



}
