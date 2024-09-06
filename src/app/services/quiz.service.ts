import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'https://opentdb.com/api.php?amount=50&type=multiple';

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
