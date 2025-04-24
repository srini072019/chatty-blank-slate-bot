
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/question.types";
import QuestionPreview from "@/components/question/QuestionPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ExamPreviewProps {
  questions: Question[];
  useQuestionPool?: boolean;
  totalPoolQuestions?: number;
}

const ExamPreview = ({ questions, useQuestionPool, totalPoolQuestions }: ExamPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Exam Preview ({questions.length} Questions
          {useQuestionPool && totalPoolQuestions ? ` from pool of ${totalPoolQuestions}` : ""})
        </CardTitle>
        {useQuestionPool && (
          <Alert variant="default" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This exam uses a question pool. {totalPoolQuestions || questions.length} questions will be 
              randomly selected from the pool when a candidate takes the exam.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id}>
                  <div className="font-medium mb-2">Question {index + 1}</div>
                  <QuestionPreview question={question} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {useQuestionPool ? 
                "No questions available in the selected subjects pool." :
                "No questions have been added to this exam yet."
              }
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ExamPreview;
