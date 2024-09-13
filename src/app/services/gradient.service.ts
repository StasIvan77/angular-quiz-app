// src/app/gradient.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GradientService {
  private gradients = [
    'from-blue-500 to-purple-500',
    'from-green-400 to-blue-500',
    'from-red-500 to-yellow-500',
    'from-yellow-500 to-pink-500',
  ];

  getRandomGradient(): string {
    const randomIndex = Math.floor(Math.random() * this.gradients.length);
    return this.gradients[randomIndex];
  }
}
