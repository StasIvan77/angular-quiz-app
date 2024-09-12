// src/app/services/quiz.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { Quiz } from '../models/quiz.model';
import { Category } from '../models/category.model';
import { Question } from '../models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private tokenUrl = 'https://opentdb.com/api_token.php?command=request';
  private resetTokenUrl = 'https://opentdb.com/api_token.php?command=reset';
  private token: string | null = null;

  private apiUrl = 'https://opentdb.com/';

  private categoriesSignal: WritableSignal<Category[]> = signal([]);
  private totalQuestionsSignal: WritableSignal<number> = signal(0);
  

  constructor(private http: HttpClient) {}

  getSessionToken(): Observable<string> {
    if (this.token) {
      console.log('Using cached session token:', this.token);
      return of(this.token); // Return cached token
    } else {
      console.log('Fetching new session token...');
      return this.http.get<{ token: string }>(this.tokenUrl).pipe(
        map(response => response.token),
        tap(token => {
          this.token = token;
          console.log('New session token received:', token);
        })
      );
    }
  }

   // Reset session token when needed
   resetSessionToken(): Observable<string> {
    if (this.token) {
      console.log('Resetting session token:', this.token);
      return this.http.get<{ token: string }>(`${this.resetTokenUrl}&token=${this.token}`).pipe(
        map(response => response.token),
        tap(token => {
          this.token = token;
          console.log('Session token reset successfully:', token);
        })
      );
    }
    return this.getSessionToken();
  }

  // Fetch categories
  fetchCategories(): void {
    console.log('Fetching categories...');
    this.http.get<{ trivia_categories: Category[] }>(`${this.apiUrl}api_category.php`)
      .subscribe(response => {
        this.categoriesSignal.set(response.trivia_categories);
        console.log('Categories fetched:', response.trivia_categories);
      });
  }

  fetchQuestions(amount: number, category: number | null, difficulty: string): Observable<Question[]> {
    console.log('Fetching questions:', { amount, category, difficulty });
    return this.getSessionToken().pipe(
      switchMap(token => {
        console.log('Using token for fetch:', token);
        let params = new HttpParams().set('amount', amount.toString()).set('token', token);
        if (category !== null) {
          params = params.set('category', category.toString());
        }
        if (difficulty) {
          params = params.set('difficulty', difficulty);
        }
        console.log('Request URL params:', params.toString());
  
        return this.http.get<{ results: Question[] }>(`${this.apiUrl}api.php`, { params }).pipe(
          tap(response => console.log('Questions fetched:', response)),
          map(response => response.results),
          catchError((error) => {
            if (error.status === 429) {
              console.log('Too many requests, retrying...');
              return throwError(() => error); // Throw error for further handling
            }
            return throwError(() => error); // Handle other errors
          }),
          retryWhen(errors =>
            errors.pipe(
              delay(1000), // Wait for 1 second before retrying
              take(3) // Retry up to 3 times
            )
          )
        );
      })
    );
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

  // Fetch random quizzes
  getRandomQuiz(count: number): Observable<Quiz[]> {
    return this.getSessionToken().pipe(
      switchMap(token => this.http.get<Quiz[]>(`${this.apiUrl}api.php?amount=${count}&token=${token}`))
    );
  }

    // Custom quiz fetch with session token
   // Custom quiz fetch with session token
   getQuizzes(params: {
    category: string | null;
    amount: number;
    difficulty: string;
    type: string;
    encoding: string;
  }): Observable<any> {
    console.log('Fetching quizzes with params:', params);
    return this.getSessionToken().pipe(
      switchMap(token => {
        let httpParams = new HttpParams()
          .set('amount', params.amount.toString())
          .set('token', token);
  
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
  
        console.log('Request URL with params:', httpParams.toString());
  
        return this.http.get<any>(`${this.apiUrl}api.php`, { params: httpParams }).pipe(
          tap(response => console.log('Quizzes fetched:', response)),
          catchError((error) => {
            if (error.status === 429) {
              console.log('Too many requests in getQuizzes, retrying...');
              return throwError(() => error); // Pass the error for retry logic
            }
            return throwError(() => error); // Handle other errors
          }),
          retryWhen(errors =>
            errors.pipe(
              delay(1000), // Wait 1 second before retrying
              take(3) // Retry up to 3 times
            )
          )
        );
      })
    );
  }
}
