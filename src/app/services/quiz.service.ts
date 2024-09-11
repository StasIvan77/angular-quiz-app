// src/app/services/quiz.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quiz } from '../models/quiz.model';
import { Category } from '../models/category.model';
import { Question } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'https://opentdb.com/';

  private categoriesSignal: WritableSignal<Category[]> = signal([]);
  private totalQuestionsSignal: WritableSignal<number> = signal(0);
  private quizzesSignal: WritableSignal<Quiz[]> = signal([]);
  

  constructor(private http: HttpClient) {}

  fetchCategories(): void {
    this.http.get<{ trivia_categories: Category[] }>(`${this.apiUrl}api_category.php`)
      .subscribe(response => {
        this.categoriesSignal.set(response.trivia_categories);
      });
  }

  fetchQuestions(amount: number, category: number | null, difficulty: string): Observable<Question[]> {
    let url = `https://opentdb.com/api.php?amount=${amount}`;
    if (category !== null) {
      url += `&category=${category}`;
    }
    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }
    return this.http.get<{ results: Question[] }>(url).pipe(map(response => response.results));
  }


  // Отримання категорій
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}api_category.php`);
  }

  // Отримання загальної кількості питань
  fetchTotalQuestionCount(): void {
    this.http.get<{ total_questions: number }>(`${this.apiUrl}api_count_global.php`)
      .subscribe(response => {
        this.totalQuestionsSignal.set(response.total_questions);
      });
  }

  getTotalQuestionCount() {
    return this.totalQuestionsSignal.asReadonly();
  }

  // Отримання випадкових квізів
  getRandomQuiz(count: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}api.php?amount=${count}`);
  }

  getQuizzes(params: {
    category: string | null;
    amount: number;
    difficulty: string;
    type: string;
    encoding: string;
  }): Observable<any> {
    let httpParams = new HttpParams()
    .set('amount', params.amount.toString());

  // Conditionally add parameters if they have a value
  if (params.category) {
    httpParams = httpParams.set('category', params.category);
  }
  if (params.difficulty) {
    httpParams = httpParams.set('difficulty', params.difficulty);
  }
  if (params.type) {
    httpParams = httpParams.set('type', params.type);
  }
  if (params.encoding) {
    httpParams = httpParams.set('encode', params.encoding);
  }

  // Build the full URL with parameters
  const urlWithParams = `?${httpParams.toString()}`;

  // Log the URL to the console
  console.log('Request URL:', `${this.apiUrl}api.php` + urlWithParams);

  // Make the HTTP request
  return this.http.get<any>(`${this.apiUrl}api.php`, { params: httpParams });
}
}
