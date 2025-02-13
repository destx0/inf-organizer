export interface QuizMetadata {
	createdAt?: { seconds: number; nanoseconds: number };
	isPremium?: boolean;
	title: string;
	description?: string;
	duration?: number;
	negativeScore?: number;
	positiveScore?: number;
	thumbnailLink?: string;
	primaryQuizId?: string;
	quizIds?: {
		language: string;
		quizId: string;
	}[];
}

export interface EditFormData {
	title: string;
	description: string;
	duration: string;
	positiveScore: string;
	negativeScore: string;
} 