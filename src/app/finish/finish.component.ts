import { Component, OnInit } from '@angular/core';
import { StoreService } from '../services/store.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-finish',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss']
})
export class FinishComponent implements OnInit {
  score: number = 0;
  correctAnswers: number = 0;
  totalQuestions: number = 0;
  timeTaken: string = '';

  constructor(private storeService: StoreService, private router: Router) {}

  ngOnInit(): void {
    // Retrieve the data from StoreService (or other state)
    const quizResults = this.storeService.getQuizResults();
    if (quizResults) {
      this.score = quizResults.score;
      this.correctAnswers = quizResults.correctAnswers;
      this.totalQuestions = quizResults.totalQuestions;

      // Convert timeTaken to a number of seconds and format it
      this.timeTaken = this.formatTime(Number(quizResults.timeTaken)); // Assuming timeTaken is already a string representing seconds
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  }
  

  restartQuiz(): void {
    this.storeService.resetQuiz();
    this.router.navigate(['/quiz']); // Redirect back to home page to start again
  }
  goToMenu(): void {
    this.router.navigate(['/home']); // Переходимо до головного меню
  }
  getScoreStyle() {
    const maxIntensity = 255; // Maximum intensity of red
    const minRedIntensity = 0.2 * maxIntensity; // 20% red intensity
    
    if (this.score < 0) {
      // For negative values: starting red intensity is set to a higher value
      const intensity = Math.min(Math.abs(this.score) * 50, maxIntensity); // Increased multiplier for more red
      return {
        'color': `rgb(${Math.max(minRedIntensity, 255 - intensity)}, 0, 0)` // Intense red
      };
    } else {
      // For positive values: transitioning from light green to dark green
      const maxGreen = 255; // Maximum intensity of green
      const intensity = Math.min(this.score * 5, maxGreen); // Adjust multiplier to control color transition
      return {
        'color': `rgb(0, ${maxGreen - intensity}, 0)` // Green gradient
      };
    }
  }
  
  
  
  
  
  
  
  
  
}
