import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../services/store.service';
import { CommonModule } from '@angular/common';
import { Quiz } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { decodeHtmlEntities } from '../utils/html-entity-decoder';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule
  ]
})
export class QuizComponent implements OnInit, OnDestroy {
  quiz: WritableSignal<Quiz | null> = signal(null);
  currentQuestionIndex: WritableSignal<number> = signal(0);
  score: WritableSignal<number> = signal(0);
  userAnswers: WritableSignal<Map<number, string>> = signal(new Map());
  safeQuestions: SafeHtml[] = []; // To hold sanitized questions
  answers: string[] = [];
  correctAnswers: number = 0;
  startTime: number = 0;
  timeTaken: string = '';

  constructor(private storeService: StoreService, private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.startTime = Date.now(); // Start timer when component initializes
  }

  ngOnDestroy(): void {
    this.calculateResults();
  }

  ngOnInit(): void {
    const currentQuiz = this.storeService.getCurrentQuiz();
    this.quiz.set(currentQuiz); // Set the value to the signal

    // Check if the quiz is defined and has questions
    const quizValue = this.quiz();
    if (quizValue && quizValue.questions) {
      this.safeQuestions = quizValue.questions.map((question: any) =>
        this.sanitizer.bypassSecurityTrustHtml(decodeHtmlEntities(question.question))
      );
      //console.log(decodeHtmlEntities(quizValue.questions[0].question))
      this.shuffleAnswers()
      
      }
    }

    getCurrentQuestion(): Question | null {
      const quiz = this.quiz();
      return quiz?.questions?.[this.currentQuestionIndex()] || null;
    }
  
    shuffleAnswers(): void {
      const quizValue = this.quiz();
      if (quizValue && quizValue.questions.length > 0) {
        const currentQuestion = quizValue.questions[this.currentQuestionIndex()];
        
        if (currentQuestion && currentQuestion.incorrect_answers) { // Check if currentQuestion and its properties are defined
          this.answers = this.shuffle([
            ...currentQuestion.incorrect_answers.map(answer => decodeHtmlEntities(answer)),
            decodeHtmlEntities(currentQuestion.correct_answer)
          ]);
        } else {
          console.error('Current question or its properties are undefined');
        }
      } else {
        console.error('Quiz value or questions are undefined');
      }
    }
  
    shuffle(array: any[]): any[] {
      let currentIndex = array.length;
      let randomIndex: number;
  
      // While there remain elements to shuffle.
      while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
        // Swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
  
      return array;
    }


    get currentQuestion(): Question | null {
      const quiz = this.quiz();
      const question = quiz?.questions?.[this.currentQuestionIndex()];
      return question || null;
    }
    

  get question(): string {
    return this.currentQuestion?.question || '';
  }

  

  selectAnswer(answer: string): void {
    const currentQuestion = this.currentQuestion;
    if (currentQuestion) {
      const isCorrect = answer === currentQuestion.correct_answer;
      const currentIndex = this.currentQuestionIndex();

      // Update the score
      this.score.set(this.score() + (isCorrect ? 10 : -10));

      // Increment correctAnswers if the answer is correct
      if (isCorrect) {
        this.correctAnswers++;
      }

      // Save the user's answer
      const answers = this.userAnswers();
      answers.set(currentIndex, answer);
      this.userAnswers.set(new Map(answers)); // Update signal with new map

      // Move to the next question
      const nextIndex = currentIndex + 1;

      // Shuffle answers for the next question
      this.shuffleAnswers();

      // Check if it's the last question
      if (nextIndex < (this.quiz()?.questions?.length || 0)) {
        this.currentQuestionIndex.set(nextIndex);
        this.shuffleAnswers();  // Shuffle answers for the next question
      } else {
        // If no more questions, navigate to the finish page
        this.calculateResults();
        this.router.navigate(['/finish']);
      }
    } else {
      console.error('Current question is undefined');
    }
  }

  isQuizComplete(): boolean {
    return this.currentQuestionIndex() >= (this.quiz()?.questions?.length || 0);
  }

  cancelQuiz(): void {
    this.router.navigate(['/home']);
  }

   // Calculate results when quiz ends
   calculateResults(): void {
    const endTime = Date.now();
    const timeDifference = endTime - this.startTime; // Time in milliseconds
    this.timeTaken = this.formatTime(timeDifference);

    // Pass results to StoreService
    this.storeService.setQuizResults({
      score: this.score(),
      correctAnswers: this.correctAnswers,
      totalQuestions: this.quiz()?.questions.length || 0,
      timeTaken: this.timeTaken
    });
  }

  // Utility method to format time
  formatTime(milliseconds: number): string {
    const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  }
}