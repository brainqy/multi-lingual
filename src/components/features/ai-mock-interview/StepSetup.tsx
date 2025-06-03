
"use client";

import type React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import type { GenerateMockInterviewQuestionsInput, InterviewQuestionCategory } from '@/types';
import { Brain, Timer, ListFilter } from 'lucide-react'; 

const ALL_QUESTION_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'];

const setupSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  jobDescription: z.string().optional(),
  numQuestions: z.coerce.number().min(1, "Must request at least 1 question.").max(50, "Cannot request more than 50 questions.").default(5), // Updated max to 50
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  timerPerQuestion: z.coerce.number().min(0).max(300).optional().default(0),
  questionCategories: z.array(z.string()).optional(), 
});

type SetupFormData = z.infer<typeof setupSchema>;

interface StepSetupProps {
  onSetupComplete: (config: GenerateMockInterviewQuestionsInput) => void;
  isLoading?: boolean;
}

export default function StepSetup({ onSetupComplete, isLoading }: StepSetupProps) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      topic: '',
      jobDescription: '',
      numQuestions: 5,
      difficulty: 'medium',
      timerPerQuestion: 0,
      questionCategories: [],
    }
  });

  const selectedCategories = watch("questionCategories", []);

  const onSubmit = (data: SetupFormData) => {
    const config: GenerateMockInterviewQuestionsInput = {
      ...data,
      timerPerQuestion: data.timerPerQuestion === 0 ? undefined : data.timerPerQuestion,
      questionCategories: data.questionCategories as InterviewQuestionCategory[] | undefined,
    };
    onSetupComplete(config);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="topic">Interview Topic / Role *</Label>
        <Controller
          name="topic"
          control={control}
          render={({ field }) => <Input id="topic" placeholder="e.g., Frontend Developer, Marketing Manager" {...field} />}
        />
        {errors.topic && <p className="text-sm text-destructive mt-1">{errors.topic.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">Specify the role or general area you want to practice for.</p>
      </div>

      <div>
        <Label htmlFor="jobDescription">Job Description (Optional)</Label>
        <Controller
          name="jobDescription"
          control={control}
          render={({ field }) => <Textarea id="jobDescription" placeholder="Paste the job description here for more tailored questions..." rows={6} {...field} />}
        />
        <p className="text-xs text-muted-foreground mt-1">Providing a job description helps the AI generate more relevant questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="numQuestions">Number of Questions (1-50)</Label>
          <Controller
            name="numQuestions"
            control={control}
            render={({ field }) => (
              <Input 
                id="numQuestions" 
                type="number" 
                min="1" 
                max="50" 
                {...field} 
                onChange={e => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          />
          {errors.numQuestions && <p className="text-sm text-destructive mt-1">{errors.numQuestions.message}</p>}
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="timerPerQuestion" className="flex items-center gap-1">
            <Timer className="h-4 w-4" /> Time per Question (seconds)
          </Label>
          <Controller
            name="timerPerQuestion"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                <SelectTrigger id="timerPerQuestion">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Timer</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="90">1.5 minutes</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="180">3 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
           {errors.timerPerQuestion && <p className="text-sm text-destructive mt-1">{errors.timerPerQuestion.message}</p>}
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-1 mb-2"><ListFilter className="h-4 w-4" /> Question Categories (Optional)</Label>
        <Controller
            name="questionCategories"
            control={control}
            render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border rounded-md bg-secondary/30">
                    {ALL_QUESTION_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                        id={`category-${category}`}
                        checked={field.value?.includes(category)}
                        onCheckedChange={(checked) => {
                            const currentCategories = field.value || [];
                            if (checked) {
                            field.onChange([...currentCategories, category]);
                            } else {
                            field.onChange(currentCategories.filter((value) => value !== category));
                            }
                        }}
                        />
                        <Label htmlFor={`category-${category}`} className="font-normal text-sm cursor-pointer">{category}</Label>
                    </div>
                    ))}
                </div>
            )}
        />
        <p className="text-xs text-muted-foreground mt-1">Select specific question types or leave blank for a general mix.</p>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
        {isLoading ? 'Starting...' : 'Start Mock Interview'}
        {!isLoading && <Brain className="ml-2 h-5 w-5" />}
      </Button>
    </form>
  );
}

