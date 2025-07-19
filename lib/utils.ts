import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures all survey questions have unique _key fields
 * @param questions Array of survey questions
 * @returns Questions with unique keys assigned
 */
export function ensureSurveyQuestionKeys(questions: any[]): any[] {
  return questions.map((question, index) => ({
    ...question,
    _key: question._key || `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
  }));
}
