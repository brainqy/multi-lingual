
"use client";

import type React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, ChevronLeft, ChevronRight, PlusCircle, Edit3, XCircle as XCircleIcon, Star, Bookmark as BookmarkIcon, CheckCircle as CheckCircleIcon, Code as CodeIcon, Lightbulb, MessageSquare, Puzzle, Settings2, Brain as BrainIcon, Users as UsersGroupIcon, Send } from 'lucide-react';
import type { InterviewQuestion, InterviewQuestionCategory, BankQuestionSortOrder, BankQuestionFilterView, UserProfile } from '@/types';
import { ALL_CATEGORIES } from '@/types';
import { cn } from "@/lib/utils";
import { parseISO, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { sampleInterviewQuestions } from '@/lib/sample-data';


interface QuestionBankProps {
  allBankQuestions: InterviewQuestion[];
  currentUser: UserProfile;
  onOpenNewQuestionDialog: () => void;
  onOpenEditQuestionDialog: (question: InterviewQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
}

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionBank({ allBankQuestions, currentUser, onOpenNewQuestionDialog, onOpenEditQuestionDialog, onDeleteQuestion, onToggleBookmark }: QuestionBankProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedBankCategories, setSelectedBankCategories] = useState<InterviewQuestionCategory[]>([]);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [bankSortOrder, setBankSortOrder] = useState<BankQuestionSortOrder>('default');
  const [bankFilterView, setBankFilterView] = useState<BankQuestionFilterView>('all');
  const [selectedQuestionsForQuiz, setSelectedQuestionsForQuiz] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [userComments, setUserComments] = useState<Record<string, string>>({});


  const filteredBankQuestions = useMemo(() => {
    let questionsToFilter = [...allBankQuestions];
    if (bankFilterView === 'myBookmarks') {
      questionsToFilter = questionsToFilter.filter(q => q.bookmarkedBy?.includes(currentUser.id));
    } else if (bankFilterView === 'needsApproval' && currentUser.role === 'admin') {
      questionsToFilter = questionsToFilter.filter(q => q.approved === false);
    } else {
      questionsToFilter = questionsToFilter.filter(q => q.approved !== false || q.createdBy === currentUser.id || currentUser.role === 'admin');
    }
    if (selectedBankCategories.length > 0) {
      questionsToFilter = questionsToFilter.filter(q => q.category && selectedBankCategories.includes(q.category));
    }
    if (bankSearchTerm.trim() !== '') {
      const searchTermLower = bankSearchTerm.toLowerCase();
      questionsToFilter = questionsToFilter.filter(q =>
        q.questionText.toLowerCase().includes(searchTermLower) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    }
    if (bankSortOrder === 'highestRated') {
      questionsToFilter.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (bankSortOrder === 'mostRecent') {
      questionsToFilter.sort((a, b) => {
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    return questionsToFilter;
  }, [allBankQuestions, selectedBankCategories, bankSearchTerm, currentUser.role, currentUser.id, bankSortOrder, bankFilterView]);

  const paginatedBankQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredBankQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredBankQuestions, currentPage, questionsPerPage]);

  const totalPages = Math.ceil(filteredBankQuestions.length / questionsPerPage);

  const handleToggleQuestionForQuiz = (questionId: string) => {
    setSelectedQuestionsForQuiz(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  };

  const handleCreateQuiz = () => {
    if (selectedQuestionsForQuiz.size === 0) {
        toast({ title: "No Questions Selected", description: "Please select questions to include in the quiz.", variant: "destructive" });
        return;
    }
    const validMcqQuestionIds = Array.from(selectedQuestionsForQuiz).filter(id => {
        const q = allBankQuestions.find(bq => bq.id === id);
        return q && q.isMCQ && q.mcqOptions && q.correctAnswer;
    });

    if (validMcqQuestionIds.length === 0) {
        toast({ title: "No Valid MCQ Questions", description: "Please select valid Multiple Choice Questions with options and a correct answer to create a quiz.", variant: "destructive", duration: 5000 });
        return;
    }
    if (validMcqQuestionIds.length !== selectedQuestionsForQuiz.size) {
      toast({ title: "Some Questions Invalid", description: `Only ${validMcqQuestionIds.length} valid MCQ questions were used. Others were excluded.`, variant: "default", duration: 5000 });
    }

    const questionIdsQueryParam = validMcqQuestionIds.join(',');
    router.push(`/interview-prep/quiz/edit?mode=new&questions=${questionIdsQueryParam}`);
  };
  
  const handleRatingSubmit = (questionId: string) => {
    const rating = userRatings[questionId];
    const comment = userComments[questionId];

    if (!rating) {
        toast({ title: "Rating Required", description: "Please select a star rating before submitting.", variant: "destructive" });
        return;
    }
    
    // Find the question in the original sample data to mutate it
    const questionIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return;

    const questionToUpdate = sampleInterviewQuestions[questionIndex];

    // Update ratings
    const existingRatingIndex = questionToUpdate.userRatings?.findIndex(r => r.userId === currentUser.id) ?? -1;
    if (existingRatingIndex !== -1) {
        questionToUpdate.userRatings![existingRatingIndex] = { userId: currentUser.id, rating };
    } else {
        if (!questionToUpdate.userRatings) questionToUpdate.userRatings = [];
        questionToUpdate.userRatings.push({ userId: currentUser.id, rating });
    }
    
    // Recalculate average rating
    const totalRating = questionToUpdate.userRatings.reduce((sum, r) => sum + r.rating, 0);
    questionToUpdate.ratingsCount = questionToUpdate.userRatings.length;
    questionToUpdate.rating = totalRating / questionToUpdate.ratingsCount;

    // Add comment if provided
    if (comment && comment.trim() !== "") {
        if (!questionToUpdate.userComments) questionToUpdate.userComments = [];
        questionToUpdate.userComments.push({
            id: `uc-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.profilePictureUrl || "",
            comment: comment.trim(),
            timestamp: new Date().toISOString(),
        });
    }

    // This is a mock update. In a real app, this would be an API call.
    // The parent component's state (`allBankQuestions`) will re-render with this mutated data.
    toast({ title: "Feedback Submitted", description: "Thank you for helping improve the question bank!" });

    // Clear local input state
    setUserRatings(prev => ({ ...prev, [questionId]: 0 }));
    setUserComments(prev => ({ ...prev, [questionId]: '' }));
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <UsersGroupIcon className="h-4 w-4 text-purple-500 flex-shrink-0"/>;
      case 'Technical': return <Settings2 className="h-4 w-4 text-orange-500 flex-shrink-0"/>;
      case 'Coding': return <CodeIcon className="h-4 w-4 text-sky-500 flex-shrink-0"/>;
      case 'Role-Specific': return <BrainIcon className="h-4 w-4 text-indigo-500 flex-shrink-0"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>;
      default: return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>; 
    }
  };
  
  return (
    <Card className="shadow-lg" id="question-bank">
       <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListFilter className="h-5 w-5 text-primary"/>Question Bank ({filteredBankQuestions.length})</CardTitle>
                <CardDescription>Browse, filter, and select questions for your practice quizzes.</CardDescription>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                 <Button onClick={onOpenNewQuestionDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Question</Button>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                    placeholder="Search questions or tags..."
                    value={bankSearchTerm}
                    onChange={e => setBankSearchTerm(e.target.value)}
                    className="md:col-span-2"
                />
                <Select value={bankSortOrder} onValueChange={(value: BankQuestionSortOrder) => setBankSortOrder(value)}>
                    <SelectTrigger><SelectValue placeholder="Sort by..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="highestRated">Highest Rated</SelectItem>
                        <SelectItem value="mostRecent">Most Recent</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="font-medium mb-2 block text-sm">Filter by:</Label>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <ToggleGroup type="single" variant="outline" value={bankFilterView} onValueChange={(value: BankQuestionFilterView) => { if(value) setBankFilterView(value);}} className="flex flex-wrap gap-1 justify-start">
                        <ToggleGroupItem value="all" aria-label="All Questions" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All Questions</ToggleGroupItem>
                        <ToggleGroupItem value="myBookmarks" aria-label="My Bookmarks" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">My Bookmarks</ToggleGroupItem>
                        {currentUser.role === 'admin' && <ToggleGroupItem value="needsApproval" aria-label="Needs Approval" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Needs Approval</ToggleGroupItem>}
                    </ToggleGroup>
                    <ToggleGroup type="multiple" variant="outline" value={selectedBankCategories} onValueChange={(value) => setSelectedBankCategories(value as InterviewQuestionCategory[])} className="flex flex-wrap gap-1 justify-start">
                        {ALL_CATEGORIES.map(category => (
                            <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`} className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                {getCategoryIcon(category)} <span className="ml-1">{category}</span>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </div>

            <ScrollArea className="h-[500px] pr-2 -mr-2">
                {paginatedBankQuestions.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-2">
                    {paginatedBankQuestions.map(q => (
                      <AccordionItem key={q.id} value={`item-${q.id}`} className="border rounded-md bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 p-3">
                            <div className="flex items-center pt-1">
                                <Checkbox id={`select-q-${q.id}`} checked={selectedQuestionsForQuiz.has(q.id)} onCheckedChange={() => handleToggleQuestionForQuiz(q.id)} aria-label={`Select question: ${q.questionText}`} />
                            </div>
                            <AccordionTrigger className="flex-1 p-0 text-left hover:no-underline justify-between">
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {getCategoryIcon(q.category)}
                                        <span className="font-medium text-foreground">{q.questionText}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                                        <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500"/> {(q.rating || 0).toFixed(1)} ({q.ratingsCount || 0})</div>
                                        <span className="mx-1">|</span>
                                        {q.difficulty && <Badge variant="outline" className="text-[10px] px-1 py-0">{q.difficulty}</Badge>}
                                        {q.tags && q.tags.length > 0 && (<span className="mx-1 hidden sm:inline">|</span>)}
                                        {q.tags?.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 hidden sm:inline-flex">{tag}</Badge>)}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onToggleBookmark(q.id); }}>
                                    <BookmarkIcon className={cn("h-4 w-4", q.bookmarkedBy?.includes(currentUser.id) && "fill-yellow-400 text-yellow-500")} />
                                </Button>
                                {(q.createdBy === currentUser.id || currentUser.role === 'admin') && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onOpenEditQuestionDialog(q); }}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                )}
                                {currentUser.role === 'admin' && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDeleteQuestion(q.id); }}>
                                        <XCircleIcon className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <AccordionContent className="px-4 pb-3 pt-0 space-y-3">
                           <div className="bg-primary/5 p-3 rounded-md">
                                <p className="text-xs font-semibold text-primary mb-1">Suggested Answer/Tip:</p>
                                <p className="text-xs text-foreground whitespace-pre-line">{q.answerOrTip}</p>
                            </div>
                            {q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && (
                                <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground">MCQ Options:</p>
                                {q.mcqOptions.filter(opt => opt && opt.trim() !== "").map((opt, i) => (
                                    <p key={i} className={cn("text-xs pl-2", q.correctAnswer === opt && "font-bold text-green-600 flex items-center gap-1")}>
                                    {q.correctAnswer === opt && <CheckCircleIcon className="h-3 w-3"/>} {optionLetters[i]}. {opt}
                                    </p>
                                ))}
                                </div>
                            )}
                             {q.userComments && q.userComments.length > 0 && (
                                <div className="space-y-2 pt-2 border-t mt-3">
                                  <p className="text-xs font-semibold text-muted-foreground">Community Comments:</p>
                                  {q.userComments.map(comment => (
                                      <div key={comment.id} className="flex items-start gap-2 text-xs">
                                          <Avatar className="h-6 w-6"><AvatarImage src={comment.userAvatar} alt={comment.userName}/><AvatarFallback>{comment.userName.substring(0,1)}</AvatarFallback></Avatar>
                                          <div>
                                              <span className="font-semibold">{comment.userName}</span>
                                              <span className="text-muted-foreground/80 ml-2 text-[10px]">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span>
                                              <p className="text-muted-foreground">{comment.comment}</p>
                                          </div>
                                      </div>
                                  ))}
                                </div>
                              )}
                              <Separator className="my-3"/>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold">Rate this question:</p>
                                <div className="flex items-center gap-1">
                                  {[1,2,3,4,5].map(rating => (
                                    <Button key={rating} variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUserRatings(prev => ({...prev, [q.id]: rating}))}>
                                      <Star className={cn("h-4 w-4 text-muted-foreground", (userRatings[q.id] || 0) >= rating && "fill-yellow-400 text-yellow-500")} />
                                    </Button>
                                  ))}
                                </div>
                                <Textarea
                                  placeholder="Add a comment (optional)..."
                                  className="text-xs"
                                  rows={2}
                                  value={userComments[q.id] || ''}
                                  onChange={(e) => setUserComments(prev => ({...prev, [q.id]: e.target.value}))}
                                />
                                <Button size="sm" onClick={() => handleRatingSubmit(q.id)}>
                                  <Send className="h-4 w-4 mr-2" />Submit Feedback
                                </Button>
                              </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    </Accordion>
                ) : (
                    <p className="text-muted-foreground text-center py-6">No questions found matching your criteria.</p>
                )}
            </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4 flex-wrap justify-between items-center gap-2">
            <div className="flex justify-center items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={handleCreateQuiz} disabled={selectedQuestionsForQuiz.size === 0} className="bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz from Selected ({selectedQuestionsForQuiz.size})
            </Button>
        </CardFooter>
    </Card>
  );
}

