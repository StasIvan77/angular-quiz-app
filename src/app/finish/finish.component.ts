import { Component, OnInit } from '@angular/core';
import { StoreService } from '../services/store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-finish',
  standalone: true,
  imports: [],
  templateUrl: './finish.component.html',
  styleUrl: './finish.component.scss'
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
      this.timeTaken = quizResults.timeTaken;
    }
  }

  // Function to restart the quiz
  restartQuiz(): void {
    this.storeService.resetQuiz();
    this.router.navigate(['/home']); // Redirect back to home page to start again
  }
}
