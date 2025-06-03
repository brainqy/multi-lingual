
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { sampleCreatedQuizzes, sampleInterviewQuestions, sampleUserProfile } from '@/lib/sample-data';
import type { MockInterviewSession, InterviewQuestion, InterviewQuestionCategory } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types';
import { ChevronLeft, Save, PlusCircle, Trash2, ListFilter, Search, Tag, Users, Zap, Brain, Puzzle, MessageSquare, Lightbulb, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const { toast } = useToast();

  const [quizDetails, setQuizDetails] = useState<MockInterviewSession | null>(null);
  const [originalQuizQuestions, setOriginalQuizQuestions] = useState<MockInterviewSession['questions']>([]);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<MockInterviewSession['questions']>([]);
  
  // State for question bank
  const [allBankQuestions, setAllBankQuestions] = useState<InterviewQuestion[]>(sampleInterviewQuestions);
  const [selectedBankCategories, setSelectedBankCategories] = useState<InterviewQuestionCategory[]>([]);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [selectedQuestionsToAdd, setSelectedQuestionsToAdd] = useState<Set<string>>(new Set());

  useEffect(() => {
    const quizToEdit = sampleCreatedQuizzes.find(q => q.id === quizId);
    if (quizToEdit) {
      // Deep copy questions to avoid direct mutation of sample data if needed
      const initialQuestions = quizToEdit.questions.map(q => ({...q}));
      setQuizDetails(quizToEdit);
      setTopic(quizToEdit.topic);
      setDescription(quizToEdit.description || '');
      setQuizQuestions(initialQuestions);
      setOriginalQuizQuestions(initialQuestions); // Keep a copy of original
    } else if (quizId === 'new') {
      const questionIdsParam = new URLSearchParams(window.location.search).get('questions');
      const questionIds = questionIdsParam ? questionIdsParam.split(',') : [];
      const preselectedQuestions = sampleInterviewQuestions
        .filter(q => questionIds.includes(q.id) && q.isMCQ && q.mcqOptions && q.correctAnswer)
        .map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty }));

      setQuizDetails({ // Initialize a new quiz structure
          id: `quiz-${Date.now()}`, // Temporary ID, real ID assigned on save
          userId: sampleUserProfile.id,
          topic: 'New Custom Quiz',
          description: 'Describe your new quiz here.',
          questions: preselectedQuestions,
          answers: [],
          status: 'pending',
          createdAt: new Date().toISOString(),
      });
      setTopic('New Custom Quiz');
      setDescription('Describe your new quiz here.');
      setQuizQuestions(preselectedQuestions);
      setOriginalQuizQuestions(preselectedQuestions);
    }
     else {
      toast({ title: "Quiz Not Found", description: "Could not find the quiz to edit.", variant: "destructive" });
      router.push('/interview-prep');
    }
  }, [quizId, router, toast]);

  const filteredBankQuestions = useMemo(() => {
    return allBankQuestions.filter(q => {
      if (!q.isMCQ || !q.mcqOptions || !q.correctAnswer) return false;
      if (q.approved === false && sampleUserProfile.role !== 'admin') return false;
      // Exclude questions already in the current quiz
      if (quizQuestions.some(quizQ => quizQ.id === q.id)) return false;

      const matchesCategory = selectedBankCategories.length === 0 || selectedBankCategories.includes(q.category);
      const matchesSearch = bankSearchTerm === '' ||
                            q.question.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(bankSearchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [allBankQuestions, selectedBankCategories, bankSearchTerm, quizQuestions]);


  const handleRemoveQuestionFromQuiz = (questionId: string) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleAddSelectedToQuiz = () => {
    const questionsToAdd = Array.from(selectedQuestionsToAdd)
      .map(id => allBankQuestions.find(q => q.id === id))
      .filter(q => q !== undefined)
      .map(q => ({ id: q!.id, questionText: q!.question, category: q!.category, difficulty: q!.difficulty }));
    
    setQuizQuestions(prev => [...prev, ...questionsToAdd]);
    setSelectedQuestionsToAdd(new Set()); // Clear selection
    toast({ title: `${questionsToAdd.length} Questions Added`, description: "Questions added to the quiz." });
  };

  const handleSaveChanges = () => {
    if (!quizDetails) return;
    if (!topic.trim()) {
        toast({ title: "Error", description: "Quiz topic cannot be empty.", variant: "destructive"});
        return;
    }
    if (quizQuestions.length === 0) {
        toast({ title: "Error", description: "Quiz must have at least one question.", variant: "destructive"});
        return;
    }

    const updatedQuiz: MockInterviewSession = {
      ...quizDetails,
      topic,
      description,
      questions: quizQuestions,
      userId: quizDetails.userId || sampleUserProfile.id, // Ensure userId is set
      status: quizDetails.status || 'pending', // Ensure status is set
      createdAt: quizDetails.createdAt || new Date().toISOString(), // Ensure createdAt is set
      answers: quizDetails.answers || [], // Ensure answers is set
    };

    // Update in sampleCreatedQuizzes (mock persistence)
    const quizIndex = sampleCreatedQuizzes.findIndex(q => q.id === updatedQuiz.id);
    if (quizIndex !== -1) {
      sampleCreatedQuizzes[quizIndex] = updatedQuiz;
    } else {
      // If it's a new quiz, add it
      sampleCreatedQuizzes.push(updatedQuiz);
    }

    toast({ title: "Quiz Saved", description: `Quiz "${topic}" has been saved.` });
    router.push('/interview-prep'); 
  };
  
  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-4 w-4 text-purple-500 flex-shrink-0"/>;
      case 'Technical': return <Zap className="h-4 w-4 text-orange-500 flex-shrink-0"/>;
      case 'Coding': return <Code className="h-4 w-4 text-sky-500 flex-shrink-0"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>;
      default: return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>;
    }
  };

  if (!quizDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading quiz details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Interview Prep
      </Button>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {quizId === 'new' ? 'Create New Quiz' : `Edit Quiz: ${quizDetails.topic}`}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quiz Details & Current Questions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quiz-topic">Quiz Topic</Label>
                <Input id="quiz-topic" value={topic} onChange={e => setTopic(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="quiz-description">Description (Optional)</Label>
                <Textarea id="quiz-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Questions in Quiz ({quizQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {quizQuestions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No questions in this quiz yet. Add some from the bank!</p>
              ) : (
                <ScrollArea className="h-[300px] pr-3">
                  <ul className="space-y-2">
                    {quizQuestions.map(q => (
                      <li key={q.id} className="p-3 border rounded-md bg-secondary/50 flex justify-between items-center">
                        <span className="text-sm truncate flex-1 mr-2" title={q.questionText}>{q.questionText}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestionFromQuiz(q.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Question Bank */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Questions from Bank</CardTitle>
              <CardDescription>Select questions to add to your quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Search question bank..."
                value={bankSearchTerm}
                onChange={e => setBankSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div>
                <Label className="text-xs font-medium mb-1 block">Filter by Categories:</Label>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={selectedBankCategories}
                    onValueChange={(value) => setSelectedBankCategories(value as InterviewQuestionCategory[])}
                    className="flex flex-wrap gap-1 justify-start"
                >
                    {ALL_CATEGORIES.map(category => (
                        <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`} className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                           {getCategoryIcon(category)} <span className="ml-1">{category}</span>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
              </div>
              <ScrollArea className="h-[400px] pr-3 border rounded-md p-2">
                {filteredBankQuestions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">No questions match your criteria or all matching questions are already in the quiz.</p>
                ) : (
                  <ul className="space-y-2">
                    {filteredBankQuestions.map(q => (
                      <li key={q.id} className="p-2.5 border rounded-md bg-card hover:bg-secondary/30 transition-colors text-xs">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`bank-q-${q.id}`}
                            checked={selectedQuestionsToAdd.has(q.id)}
                            onCheckedChange={checked => {
                              const newSelected = new Set(selectedQuestionsToAdd);
                              if (checked) newSelected.add(q.id);
                              else newSelected.delete(q.id);
                              setSelectedQuestionsToAdd(newSelected);
                            }}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`bank-q-${q.id}`} className="font-normal flex-1 cursor-pointer">
                            {q.question}
                            <div className="flex items-center gap-1 text-muted-foreground/80 mt-0.5">
                                {getCategoryIcon(q.category)} {q.category}
                                {q.difficulty && <Badge variant="outline" className="text-[10px] px-1 py-0">{q.difficulty}</Badge>}
                            </div>
                          </Label>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddSelectedToQuiz} disabled={selectedQuestionsToAdd.size === 0} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Selected to Quiz ({selectedQuestionsToAdd.size})
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveChanges} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="mr-2 h-5 w-5" /> {quizId === 'new' ? 'Create Quiz' : 'Save Quiz Changes'}
        </Button>
      </div>
    </div>
  );
}

