// src/app/app.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      transition('in => out', [animate('1s')]),
      transition('out => in', [animate('1s')])
    ]),
    trigger('routerAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('1s', style({ opacity: 0 }))
      ])
    ])
  ],
  imports: [RouterModule, CommonModule] })
export class AppComponent {
  isNavigating = false;
  showRouterOutlet = false;

  constructor(private router: Router) {}

  onOverlayClick(): void {
    if (!this.isNavigating) {
      this.isNavigating = true;
      setTimeout(() => {
        this.showRouterOutlet = true;
        this.router.navigate(['/draft']);
      }, 1000); // 1 second delay to let the "QUIZ Time" fade out
    }
  }
}
