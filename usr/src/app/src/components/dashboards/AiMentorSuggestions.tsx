
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Handshake, Zap, Loader2, RefreshCw, User as UserIcon } from "lucide-react";
import type { UserProfile } from "@/types";
import { personalizedConnectionRecommendations, type PersonalizedConnectionRecommendationsOutput } from '@/ai/flows/personalized-connection-recommendations';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface AiMentorSuggestionsProps {
    currentUser: UserProfile;
    allAlumni: UserProfile[];
}

type RecommendedConnection = PersonalizedConnectionRecommendationsOutput['suggestedConnections'][0];

export default function AiMentorSuggestions({ currentUser, allAlumni }: AiMentorSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<RecommendedConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRecommendations = useCallback(async () => {
        setIsLoading(true);
        try {
            const userProfileText = `
                Current Role: ${currentUser.currentJobTitle || 'Not specified'}
                Skills: ${(currentUser.skills || []).join(', ')}
                Bio: ${currentUser.bio || 'Not specified'}
            `;

            const availableAlumniForAI = allAlumni
                .filter(a => a.id !== currentUser.id && a.offersHelpWith && a.offersHelpWith.length > 0)
                .map(a => ({
                    id: a.id,
                    name: a.name,
                    currentJobTitle: a.currentJobTitle || 'N/A',
                    company: a.company || 'N/A',
                    skills: a.skills || [],
                    offersHelpWith: a.offersHelpWith,
                }));
            
            if (availableAlumniForAI.length === 0) {
                setSuggestions([]);
                return;
            }

            const result = await personalizedConnectionRecommendations({
                userProfileText,
                careerInterests: currentUser.careerInterests || 'General career advancement',
                availableAlumni: availableAlumniForAI,
            });
            setSuggestions(result.suggestedConnections);
        } catch (error) {
            console.error("Failed to fetch mentor recommendations:", error);
            toast({
                title: "Could not fetch AI recommendations",
                description: "There was an issue connecting to the AI service.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, allAlumni, toast]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary"/>AI Mentor Suggestions</CardTitle>
                    <CardDescription>Personalized recommendations to grow your network.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchRecommendations} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : suggestions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No specific mentor suggestions available right now. Try expanding your profile!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map(rec => {
                            const alumniDetails = allAlumni.find(a => a.id === rec.alumniId);
                            if (!alumniDetails) return null;

                            return (
                                <Card key={rec.alumniId} className="bg-secondary/50 flex flex-col">
                                    <CardContent className="p-4 flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={alumniDetails.profilePictureUrl} alt={alumniDetails.name} />
                                                <AvatarFallback>{alumniDetails.name.substring(0,1)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{alumniDetails.name}</p>
                                                <p className="text-xs text-muted-foreground">{alumniDetails.currentJobTitle}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs italic text-primary/80">"{rec.reasoning}"</p>
                                    </CardContent>
                                    <CardFooter className="p-2 border-t mt-auto">
                                        <Button asChild variant="link" size="sm" className="w-full">
                                            <Link href={`/alumni-connect`}>View Profile</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    