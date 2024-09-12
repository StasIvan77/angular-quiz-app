import { Component, OnInit } from '@angular/core';
import { StoreService } from '../services/store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finish',
  standalone: true,
  imports: [],
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
    this.router.navigate(['/home']); // Redirect back to home page to start again
  }
}
