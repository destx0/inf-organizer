import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface QuizData {
  title: string;
  description?: string;
  duration?: number;
  negativeScore?: number;
  positiveScore?: number;
  thumbnailLink?: string;
  sections: {
    name: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
  }[];
}

export class DownloaderService {
  static async downloadQuizData(quizId: string): Promise<QuizData> {
    try {
      // Get quiz data from fullQuizzes collection
      const quizRef = collection(db, "fullQuizzes");
      const q = query(quizRef, where("__name__", "==", quizId));
      const quizSnapshot = await getDocs(q);

      if (quizSnapshot.empty) {
        throw new Error("Quiz not found");
      }

      const quizData = quizSnapshot.docs[0].data();

      // Format the data for download
      const formattedData: QuizData = {
        title: quizData.title,
        description: quizData.description,
        duration: quizData.duration,
        negativeScore: quizData.negativeScore,
        positiveScore: quizData.positiveScore,
        thumbnailLink: quizData.thumbnailLink,
        sections: quizData.sections.map((section: any) => ({
          name: section.name,
          questions: section.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        })),
      };

      return formattedData;
    } catch (error) {
      console.error("Error downloading quiz data:", error);
      throw error;
    }
  }
} 