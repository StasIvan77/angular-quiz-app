import { Component, OnInit, signal, Signal } from '@angular/core';

import { Router } from '@angular/router';
import { StoreService } from '../services/store.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Quiz } from '../models/quiz.model';
import { Category } from '../models/category.model';
import { QuizService } from '../services/quiz.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ]  // Ensure CommonModule is imported here
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: number | null = null;
  numberOfQuestions: number = 3;
  category: number | null = null;
  amount: number = 4;
  defaultCategory: number = 1; // Example category, adjust or fetch dynamically
  selectedDifficulty: string = ''; // e.g., 'easy', 'medium', 'hard'
  selectedType: string = ''; // 'multiple', 'boolean', 'any'
  selectedEncoding: string = ''; // 'url3986', 'base64', 'none'    
 
  quizForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private storeService: StoreService,
    private router: Router
  ) {
    this.quizForm = this.fb.group({
      category: [null], 
      amount: [3, [Validators.required, Validators.min(1)]],
      difficulty: [''], // Add difficulty form control
      type: [''], // Add type form control
      encoding: [''] // Add encoding form control
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.quizService.getCategories().subscribe(response => {
      this.categories = response.trivia_categories;
    });
  }

  onSubmit(): void { 
    if (this.quizForm.valid) {
    const formValues = this.quizForm.value;
    this.quizService.getQuizzes(formValues).subscribe(response => {
      // Handle the response, e.g., store data or navigate
      console.log(response); // For debugging
      
      this.storeService.setCurrentQuiz({
        category: formValues.category,
        amount: formValues.amount,
        difficulty: formValues.difficulty,
        type: formValues.type,
        encoding: formValues.encoding,
        questions: response.results // Assuming `response.results` contains the quiz questions
      });

      this.router.navigate(['/quiz']); // Navigate to quiz page
    });
  }
}

  
  startQuiz(): void {
    if (this.quizForm.valid) {
      const quiz: Quiz = {
        category: this.quizForm.value.category,
        amount: this.quizForm.value.amount,
        difficulty: this.quizForm.value.difficulty,
        questions: [],
        type: this.quizForm.value.type, // Add type
        encoding: this.quizForm.value.encoding // Add encoding
      };

      this.storeService.setCurrentQuiz(quiz);
      this.router.navigate(['/quiz']);
    }
  }

  randomQuiz(): void {
    const quiz: Quiz = {
      category: this.defaultCategory,
      amount: this.quizForm.value.amount,
      difficulty: this.quizForm.value.difficulty,
      questions: [],
      type: this.quizForm.value.type, // Add type
      encoding: this.quizForm.value.encoding // Add encoding
    };

    this.storeService.setCurrentQuiz(quiz);
    this.router.navigate(['/quiz']);
  }
}