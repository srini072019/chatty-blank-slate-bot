
import { useState, useEffect } from "react";
import { Exam, ExamStatus } from "@/types/exam.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseExamsResult {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  fetchExams: (courseId?: string) => Promise<void>;
}

export const useExams = (userId?: string): UseExamsResult => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async (courseId?: string) => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('exams')
        .select('*')
        .eq('instructor_id', userId);
      
      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedExams: Exam[] = data.map(exam => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || "",
          courseId: exam.course_id,
          instructorId: exam.instructor_id,
          startDate: exam.start_date ? new Date(exam.start_date) : undefined,
          endDate: exam.end_date ? new Date(exam.end_date) : undefined,
          timeLimit: exam.time_limit,
          passingScore: exam.passing_score,
          shuffleQuestions: exam.shuffle_questions,
          status: exam.status as ExamStatus,
          useQuestionPool: exam.use_question_pool || false,
          questionPool: exam.question_pool || undefined,
          questions: [],
          createdAt: new Date(exam.created_at),
          updatedAt: new Date(exam.updated_at)
        }));

        setExams(formattedExams);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to fetch exams");
      toast.error("Failed to fetch exams");
    } finally {
      setIsLoading(false);
    }
  };

  return { exams, isLoading, error, fetchExams };
};
