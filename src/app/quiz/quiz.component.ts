import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../services/store.service';
import { CommonModule } from '@angular/common';
import { Quiz } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { decodeHtmlEntities } from '../utils/html-entity-decoder';


@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [CommonModule]
})
export class QuizComponent implements OnInit {
  quiz: WritableSignal<Quiz | null> = signal(null);
  currentQuestionIndex: WritableSignal<number> = signal(0);
  score: WritableSignal<number> = signal(0);
  userAnswers: WritableSignal<Map<number, string>> = signal(new Map());
  safeQuestions: SafeHtml[] = []; // To hold sanitized questions
  answers: string[] = [];

  constructor(private storeService: StoreService, private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const currentQuiz = this.storeService.getCurrentQuiz();
    this.quiz.set(currentQuiz); // Set the value to the signal

    // Check if the quiz is defined and has questions
    const quizValue = this.quiz();
    if (quizValue && quizValue.questions) {
      this.safeQuestions = quizValue.questions.map((question: any) =>
        this.sanitizer.bypassSecurityTrustHtml(decodeHtmlEntities(question.question))
      );
      console.log(decodeHtmlEntities(quizValue.questions[0].question))
      this.shuffleAnswers()
      
      }
    }

    getCurrentQuestion() {
      return this.safeQuestions[this.currentQuestionIndex()] ?? '';
    }
  
    shuffleAnswers(): void {
      const quizValue = this.quiz();
      if (quizValue && quizValue.questions.length > 0) {
        const currentQuestion = quizValue.questions[this.currentQuestionIndex()];
        this.answers = this.shuffle([
          ...currentQuestion.incorrect_answers.map(answer => decodeHtmlEntities(answer)),
          decodeHtmlEntities(currentQuestion.correct_answer)
        ]);
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
    return quiz?.questions?.[this.currentQuestionIndex()] || null;
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

      // Save the user's answer
      const answers = this.userAnswers();
      answers.set(currentIndex, answer);
      this.userAnswers.set(new Map(answers)); // Update signal with new map

      // Move to the next question
      this.currentQuestionIndex.set(currentIndex + 1);

      // Check if it's the last question
      if (this.currentQuestionIndex() >= (this.quiz()?.questions?.length || 0)) {
        this.router.navigate(['/finish'], { state: { score: this.score(), userAnswers: Array.from(this.userAnswers().entries()) } });
      }
    }
  }

  isQuizComplete(): boolean {
    return this.currentQuestionIndex() >= (this.quiz()?.questions?.length || 0);
  }

  cancelQuiz(): void {
    this.router.navigate(['/home']);
  }
}