
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { InterviewQuestion, InterviewQuestionCategory, InterviewQuestionDifficulty, UserProfile } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { useEffect } from 'react';

const questionFormSchema = z.object({
  questionText: z.string().min(10, "Question text is too short.").max(500, "Question text is too long."),
  category: z.enum(ALL_CATEGORIES),
  isMCQ: z.boolean().default(false),
  mcqOptions: z.array(z.string().min(1, "Option text cannot be empty").max(255, "Option too long")).min(2, "At least two options required for MCQ").max(6, "Maximum 6 options").optional(),
  correctAnswer: z.string().optional(),
  answerOrTip: z.string().min(10, "Answer/Tip is too short.").max(1000, "Answer/Tip is too long."),
  tags: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
}).refine(data => {
  if (data.isMCQ) {
    return data.mcqOptions && data.mcqOptions.length >= 2 && data.correctAnswer && data.mcqOptions.includes(data.correctAnswer);
  }
  return true;
}, {
  message: "For MCQ, please provide at least 2 options and ensure the correct answer is one of them.",
  path: ["mcqOptions"],
});

type QuestionFormData = z.infer<typeof questionFormSchema>;
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];


interface QuestionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InterviewQuestion) => void;
  editingQuestion: InterviewQuestion | null;
  currentUser: UserProfile;
}

export default function QuestionFormDialog({ isOpen, onClose, onSubmit, editingQuestion, currentUser }: QuestionFormDialogProps) {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
  });
  
  const isMCQSelected = watch("isMCQ");

  useEffect(() => {
    if (editingQuestion) {
        setValue('questionText', editingQuestion.questionText);
        setValue('category', editingQuestion.category);
        setValue('isMCQ', editingQuestion.isMCQ || false);
        const options = editingQuestion.mcqOptions || [];
        const paddedOptions = [...options, ...Array(Math.max(0, 4 - options.length)).fill("")];
        setValue('mcqOptions', paddedOptions.slice(0,4));
        setValue('correctAnswer', editingQuestion.correctAnswer || "");
        setValue('answerOrTip', editingQuestion.answerOrTip);
        setValue('tags', editingQuestion.tags?.join(', ') || "");
        setValue('difficulty', editingQuestion.difficulty || 'Medium');
    } else {
        reset({ questionText: '', category: 'Common', isMCQ: false, mcqOptions: ["", "", "", ""], correctAnswer: '', answerOrTip: '', tags: '', difficulty: 'Medium' });
    }
  }, [editingQuestion, isOpen, reset, setValue]);

  const onFormSubmit = (data: QuestionFormData) => {
    const questionPayload: InterviewQuestion = {
        id: editingQuestion?.id || `iq-${Date.now()}`,
        ...data,
        tags: data.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
        mcqOptions: data.isMCQ ? data.mcqOptions?.filter(opt => opt && opt.trim() !== "") : undefined,
        correctAnswer: data.isMCQ ? data.correctAnswer : undefined,
        approved: currentUser.role === 'admin',
        createdBy: currentUser.id,
        createdAt: editingQuestion?.createdAt || new Date().toISOString(),
        rating: editingQuestion?.rating || 0,
        ratingsCount: editingQuestion?.ratingsCount || 0,
    };
    onSubmit(questionPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="question-text">Question Text *</Label>
              <Controller name="questionText" control={control} render={({ field }) => <Textarea id="question-text" {...field} rows={3} />} />
              {errors.questionText && <p className="text-sm text-destructive mt-1">{errors.questionText.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question-category">Category *</Label>
                <Controller name="category" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="question-category"><SelectValue placeholder="Select category"/></SelectTrigger>
                        <SelectContent>{ALL_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
                 {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="question-difficulty">Difficulty</Label>
                <Controller name="difficulty" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'Medium'}>
                        <SelectTrigger id="question-difficulty"><SelectValue placeholder="Select difficulty"/></SelectTrigger>
                        <SelectContent>{(['Easy', 'Medium', 'Hard'] as InterviewQuestionDifficulty[]).map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
              </div>
            </div>
            <div>
              <Label htmlFor="question-tags">Tags (comma-separated)</Label>
              <Controller name="tags" control={control} render={({ field }) => <Input id="question-tags" {...field} placeholder="e.g., java, oop, behavioral" />} />
            </div>
             <div className="flex items-center space-x-2">
                <Controller name="isMCQ" control={control} render={({ field }) => (
                    <Checkbox id="isMCQ" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="isMCQ" className="font-normal">Is this a Multiple Choice Question?</Label>
            </div>
            {isMCQSelected && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/50 pt-2">
                    <Label>MCQ Options (at least 2 required, max 4 shown)</Label>
                    {(watch("mcqOptions") || ["","","",""]).slice(0,4).map((_,index) => ( 
                        <Controller key={index} name={`mcqOptions.${index}` as any} control={control} render={({ field }) => (
                            <Input {...field} placeholder={`Option ${optionLetters[index] || index + 1}`} className="text-sm"/>
                        )} />
                    ))}
                     <div>
                        <Label htmlFor="correctAnswer">Correct Answer (exact text of one option)</Label>
                        <Controller name="correctAnswer" control={control} render={({ field }) => (
                            <Input id="correctAnswer" {...field} placeholder="Paste the correct option text here"/>
                        )} />
                    </div>
                     {errors.mcqOptions && <p className="text-sm text-destructive mt-1">{errors.mcqOptions.message}</p>}
                     {errors.correctAnswer && <p className="text-sm text-destructive mt-1">{errors.correctAnswer.message}</p>}
                </div>
            )}
            <div>
              <Label htmlFor="answerOrTip">Suggested Answer / Explanation / Tip *</Label>
              <Controller name="answerOrTip" control={control} render={({ field }) => <Textarea id="answerOrTip" {...field} rows={4} />} />
              {errors.answerOrTip && <p className="text-sm text-destructive mt-1">{errors.answerOrTip.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingQuestion ? "Save Changes" : "Add Question"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
