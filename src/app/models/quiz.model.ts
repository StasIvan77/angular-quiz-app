import { Question } from "./question.model";

export interface Quiz {
    category: number | null;
    difficulty: string;
    amount: number;
    questions: Question[]; // Adjust based on your needs
    type: string; // e.g., 'multiple', 'boolean', or ''
    encoding: string; // e.g., 'url3986', 'base64', or 'none'
  }