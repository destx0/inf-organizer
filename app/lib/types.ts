export interface EditFormData {
  duration: string;
  positiveScore: string;
  negativeScore: string;
  title: string;
  description: string;
}

export interface QuizMetadata {
  title: string;
  description: string;
  duration: number;
  positiveScore: number;
  negativeScore: number;
  primaryQuizId?: string;
  quizIds?: { quizId: string }[];
  batchId: string;
  isPremium?: boolean;
  languages?: string[];
  // ... other existing properties
} 