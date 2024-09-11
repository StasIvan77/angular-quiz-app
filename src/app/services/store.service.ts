// src/app/services/store.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Quiz } from '../models/quiz.model';
import { QuizService } from './quiz.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private quizzes: WritableSignal<Quiz[]> = signal([]);
  quizzes$ = this.quizzes; // Use signal directly
  private currentQuiz: WritableSignal<Quiz | null> = signal(null);
  currentQuiz$ = this.currentQuiz; // Use signal directly

  

  constructor(private quizService: QuizService) {
    this.fetchQuizzes();
  }

  private fetchQuizzes(): void {
    this.quizService.getRandomQuiz(10).subscribe((quizzes: Quiz[]) => { // Explicitly type the parameter
      this.quizzes.update(() => quizzes);
    });
  }

  getQuizzes(): Quiz[] {
    return this.quizzes(); // Access the current value of the quizzes signal
  }

  getCurrentQuiz(): Quiz | null {
    return this.currentQuiz(); // Access the current value of the currentQuiz signal
  }

  setCurrentQuiz(quiz: Quiz): void {
    this.currentQuiz.set(quiz);
    this.quizService.fetchQuestions(quiz.amount, quiz.category, quiz.difficulty).subscribe(questions => {
      quiz.questions = questions;
      this.currentQuiz.set(quiz);
    });
  }

  loadQuestions(category: number | null, amount: number): void {
    // Implement question loading logic here, handle `category` being `null`
  }
}