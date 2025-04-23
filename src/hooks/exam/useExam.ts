
import { useState, useEffect } from "react";
import { Exam } from "@/types/exam.types";
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
        const { exam: examData, examQuestions: examQuestionsList } = getExamWithQuestions(examId, questions);
        
        if (!examData) {
          console.error(`Exam not found with ID: ${examId}`);
          setError("Exam not found");
          toast.error("Exam not found");
          return;
        }
        
        // If no questions are associated with the exam yet, try to fetch from the database directly
        if (examQuestionsList.length === 0) {
          console.log("No questions found in local state, fetching from database...");
          
          // Fetch question IDs from exam_questions table
          const { data: questionLinks, error: questionsError } = await supabase
            .from('exam_questions')
            .select('question_id')
            .eq('exam_id', examId);
            
          if (questionsError) {
            console.error("Error fetching exam questions:", questionsError);
          } else if (questionLinks && questionLinks.length > 0) {
            console.log("Found question links in database:", questionLinks);
            
            // Extract question IDs
            const questionIds = questionLinks.map(q => q.question_id);
            
            // Fetch corresponding question data
            const questionsFromDB = questions.filter(q => questionIds.includes(q.id));
            console.log(`Found ${questionsFromDB.length} questions from database`);
            
            setExam(examData);
            setExamQuestions(questionsFromDB);
            setError(null);
            setIsLoading(false);
            return;
          }
        }

        console.log(`Loaded exam: ${examData.title} with ${examQuestionsList.length} questions`);
        setExam(examData);
        setExamQuestions(examQuestionsList);
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
