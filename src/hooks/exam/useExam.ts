
import { useState, useEffect } from "react";
import { Exam, ExamStatus } from "@/types/exam.types";
import { Question } from "@/types/question.types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseExamResult {
  exam: Exam | null;
  examQuestions: Question[];
  isLoading: boolean;
  error: string | null;
}

export const useExam = (
  examId: string | undefined,
  getExamWithQuestions: (id: string, questions: Question[]) => { exam: Exam | null; examQuestions: Question[] },
  questions: Question[]
): UseExamResult => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        // If no examId is provided, don't try to load anything
        // This is useful for preview mode where we pass data directly
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // First, get the exam details
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*')
          .eq('id', examId)
          .single();
          
        if (examError) {
          console.error("Error fetching exam:", examError);
          setError("Exam not found");
          toast.error("Exam not found");
          setIsLoading(false);
          return;
        }
        
        if (!examData) {
          console.error(`Exam not found with ID: ${examId}`);
          setError("Exam not found");
          toast.error("Exam not found");
          setIsLoading(false);
          return;
        }
        
        // Transform exam data to match our type
        const transformedExam: Exam = {
          id: examData.id,
          title: examData.title,
          description: examData.description || "",
          courseId: examData.course_id,
          instructorId: examData.instructor_id,
          timeLimit: examData.time_limit,
          passingScore: examData.passing_score,
          shuffleQuestions: examData.shuffle_questions,
          status: examData.status as ExamStatus, // Cast string to ExamStatus enum
          questions: [],
          createdAt: new Date(examData.created_at),
          updatedAt: new Date(examData.updated_at),
          startDate: examData.start_date ? new Date(examData.start_date) : undefined,
          endDate: examData.end_date ? new Date(examData.end_date) : undefined,
          useQuestionPool: examData.use_question_pool,
          questionPool: examData.question_pool ? JSON.parse(String(examData.question_pool)) : undefined,
        };
        
        // Fetch question IDs from exam_questions table
        const { data: questionLinks, error: questionsError } = await supabase
          .from('exam_questions')
          .select('question_id')
          .eq('exam_id', examId);
            
        if (questionsError) {
          console.error("Error fetching exam questions:", questionsError);
        }
        
        let questionIds: string[] = [];
        let foundQuestions: Question[] = [];
        
        if (questionLinks && questionLinks.length > 0) {
          console.log("Found question links in database:", questionLinks);
          
          // Extract question IDs and update the exam object
          questionIds = questionLinks.map(q => q.question_id);
          transformedExam.questions = questionIds;
          
          // Find matching questions in our questions array
          foundQuestions = questions.filter(q => questionIds.includes(q.id));
          console.log(`Found ${foundQuestions.length} questions from database`);
        } else {
          console.log("No questions found in database for this exam");
        }
        
        // Try to get questions from the provided getExamWithQuestions function as a fallback
        if (foundQuestions.length === 0 && transformedExam) {
          const { examQuestions: fallbackQuestions } = getExamWithQuestions(examId, questions);
          if (fallbackQuestions.length > 0) {
            console.log(`Found ${fallbackQuestions.length} questions from local state`);
            foundQuestions = fallbackQuestions;
          }
        }

        console.log(`Loaded exam: ${transformedExam.title} with ${foundQuestions.length} questions`);
        setExam(transformedExam);
        setExamQuestions(foundQuestions);
        setError(null);
      } catch (error) {
        console.error("Error loading exam:", error);
        setError("Failed to load exam");
        toast.error("Failed to load exam");
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [examId, getExamWithQuestions, questions]);

  return { exam, examQuestions, isLoading, error };
};
