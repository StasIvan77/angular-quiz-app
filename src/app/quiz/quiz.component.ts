import { Component, OnDestroy, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
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
import { GradientService } from '../services/gradient.service';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatSnackBarModule
  ]
})
export class QuizComponent implements OnInit, OnDestroy {
  quiz: WritableSignal<Quiz | null> = signal(null);
  currentQuestionIndex: WritableSignal<number> = signal(0);
  totalQuestions = signal<number>(0);
  score: WritableSignal<number> = signal(0);
  userAnswers: WritableSignal<Map<number, string>> = signal(new Map());
  safeQuestions: SafeHtml[] = []; // To hold sanitized questions
  answers: string[] = [];
  correctAnswers: number = 0;
  startTime: number = 0;
  timeTaken: string = '';
  gradientClass?: string;
  elapsedTime: number = 0;
  timerSubscription?: Subscription;
  timer: number = 0; // Timer variable
  interval: any;

  constructor(private storeService: StoreService, private router: Router,
    private sanitizer: DomSanitizer, private gradientService: GradientService, private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {
    this.startTime = Date.now(); // Start timer when component initializes
  }

  ngOnDestroy(): void {
  this.calculateResults();
  this.storeService.setQuizResults({
    score: this.score(),
    correctAnswers: this.correctAnswers,
    totalQuestions: this.quiz()?.questions?.length || 0,
    timeTaken: this.timeTaken
  });
  if (this.timerSubscription) {
    this.timerSubscription.unsubscribe();
  }
}

  ngOnInit(): void {

    this.startTimer(); 
    this.gradientClass = this.gradientService.getRandomGradient();

    const currentQuiz = this.storeService.getCurrentQuiz();
    this.quiz.set(currentQuiz); // Set the value to the signal

    // Check if the quiz is defined and has questions
    const quizValue = this.quiz();
    if (quizValue && quizValue.questions) {
      this.totalQuestions.set(quizValue.questions.length); // Update totalQuestions
      this.safeQuestions = quizValue.questions.map((question: any) =>
        this.sanitizer.bypassSecurityTrustHtml(decodeHtmlEntities(question.question))
      );
      //console.log(decodeHtmlEntities(quizValue.questions[0].question))
      this.shuffleAnswers();
        } else {
          this.snackBar.open('Servers busy, try again in a few sec.', 'Close', {
            duration: 1000, // Duration in milliseconds
            verticalPosition: 'top', // Optional: vertical position of the snack bar
            horizontalPosition: 'center', // Optional: horizontal position of the snack bar
          });
        this.router.navigate(['']);
      
      }
    }

    

    getCurrentQuestion(): Question | null {
      const quiz = this.quiz();
      return quiz?.questions?.[this.currentQuestionIndex()] || null;
    }
  
    shuffleAnswers(): void {
      const quizValue = this.quiz();
      if (quizValue && quizValue.questions.length > 0) {
        if (this.currentQuestionIndex() >= quizValue.questions.length) {
          // No more questions available
          this.handleInsufficientQuestions();
          return;
        }
    
        const currentQuestion = quizValue.questions[this.currentQuestionIndex()];
    
        if (currentQuestion && currentQuestion.incorrect_answers) {
          this.answers = this.shuffle([
            ...currentQuestion.incorrect_answers.map(answer => decodeHtmlEntities(answer)),
            decodeHtmlEntities(currentQuestion.correct_answer)
          ]);
        } else {
          console.error('Current question or its properties are undefined');
          this.moveToNextQuestion(); // Skip this question
        }
      } else {
        console.error('Quiz value or questions are undefined');
        this.handleInsufficientQuestions(); // Handle insufficient questions
      }
    }
    
    handleInsufficientQuestions(): void {
      this.snackBar.open('Not enough questions available. Please choose different parameters or try again later.', 'Close', {
        duration: 5000, // Duration in milliseconds
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    
      // Optionally navigate to a different page or reset the quiz
      this.router.navigate(['/home']); // Or another route based on your application logic
    }
    

    moveToNextQuestion(): void {
      const totalQuestions = this.quiz()?.questions?.length || 0;
      let nextIndex = this.currentQuestionIndex() + 1;
    
      if (nextIndex >= totalQuestions) {
        // If no more questions, navigate to the finish page
        this.calculateResults();
        this.router.navigate(['/finish']);
      } else {
        // Update current question index
        this.currentQuestionIndex.set(nextIndex);
        this.shuffleAnswers(); // Shuffle answers for the new question
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

    getCurrentQuestionIndex(): number {
      return this.currentQuestionIndex();
    }

    getTotalQuestions(): number {
      return this.totalQuestions();
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
      this.score.set(this.score() + (isCorrect ? 1 : -1));

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
    this.stopTimer();
    this.router.navigate(['/home']);
  }

   // Calculate results when quiz ends
   calculateResults(): void {
    const quizValue = this.quiz();
    if (quizValue && quizValue.questions) {
      this.correctAnswers = quizValue.questions.reduce((acc, question, index) => {
        const userAnswer = this.userAnswers().get(index);
        if (userAnswer === question.correct_answer) {
          acc++;
        }
        return acc;
      }, 0);
    }
    this.timeTaken = ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

  // Utility method to format time
  formatTime(milliseconds: number): string {
    const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  }


  startGradientAnimation(): void {
    const container = document.querySelector('.quiz-container') as HTMLElement;
    if (container) {
      setInterval(() => {
        const randomX = Math.floor(Math.random() * 100);
        const randomY = Math.floor(Math.random() * 100);
        this.renderer.setStyle(container, 'background-position', `${randomX}% ${randomY}%`);
      }, 1000); // Adjust the interval for more or less frequent changes
    }
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timer += 1000; // Timer increments by 1 second (1000 ms)
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000, // Duration in milliseconds
    });
  }
}