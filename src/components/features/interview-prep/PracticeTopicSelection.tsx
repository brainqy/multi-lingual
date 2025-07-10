
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PracticeTopicSelectionProps {
  availableTopics: readonly string[];
  initialSelectedTopics: string[];
  onSelectionChange: (selectedTopics: string[]) => void;
  isSingleSelection?: boolean;
  description?: string;
}

export default function PracticeTopicSelection({ availableTopics, initialSelectedTopics, onSelectionChange, isSingleSelection = false, description }: PracticeTopicSelectionProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedTopics));

  useEffect(() => {
    setSelected(new Set(initialSelectedTopics));
  }, [initialSelectedTopics]);

  const toggleTopic = (topic: string) => {
    const newSet = isSingleSelection ? new Set([topic]) : new Set(selected);
    if (!isSingleSelection && newSet.has(topic)) {
      newSet.delete(topic);
    } else if (!isSingleSelection) {
      newSet.add(topic);
    }
    setSelected(newSet);
    onSelectionChange(Array.from(newSet)); // Notify parent on every change
  };

  return (
    <div>
        <CardHeader className="px-0 pt-0 pb-3">
            <CardDescription className="text-sm">{description || "Choose one or more topics you'd like to focus on. This will help tailor the session."}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-60 pr-3">
            <div className="space-y-3">
                {(availableTopics || []).map(topic => (
                <div key={topic} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors" onClick={() => toggleTopic(topic)}>
                    <Checkbox
                      id={`dialog-topic-${topic}`}
                      checked={selected.has(topic)}
                      onCheckedChange={() => toggleTopic(topic)}
                      className="h-5 w-5"
                      aria-label={`Select topic: ${topic}`}
                    />
                    <Label htmlFor={`dialog-topic-${topic}`} className="font-normal text-md flex-1 cursor-pointer">{topic}</Label>
                </div>
                ))}
            </div>
            </ScrollArea>
        </CardContent>
    </div>
  );
}
