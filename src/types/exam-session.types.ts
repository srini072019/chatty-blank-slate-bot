
export interface ExamSession {
  id: string;
  examId: string;
  candidateId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: {
    questionId: string;
    selectedOptions: string[];
  }[];
  score?: number;
  passed?: boolean;
  timeRemaining?: number;
  isCompleted?: boolean;
}

export interface ExamSessionState {
  session: ExamSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface ExamSessionActions {
  startExam: (examId: string) => Promise<ExamSession | null>;
  submitAnswer: (questionId: string, selectedOptions: string[]) => void;
  finishExam: () => Promise<boolean>;
  updateTimeRemaining: (timeRemaining: number) => void;
}
