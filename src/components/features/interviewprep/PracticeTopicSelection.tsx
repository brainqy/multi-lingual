
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PracticeTopicSelectionProps {
  availableTopics: string[];
  initialSelectedTopics: string[];
  onSelectionChange: (selectedTopics: string[]) => void;
}

export default function PracticeTopicSelection({ availableTopics, initialSelectedTopics, onSelectionChange }: PracticeTopicSelectionProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedTopics));

  useEffect(() => {
    setSelected(new Set(initialSelectedTopics));
  }, [initialSelectedTopics]);

  const toggleTopic = (topic: string) => {
    const newSet = new Set(selected);
    if (newSet.has(topic)) {
      newSet.delete(topic);
    } else {
      newSet.add(topic);
    }
    setSelected(newSet);
    onSelectionChange(Array.from(newSet)); // Notify parent on every change
  };

  return (
    // Removed encompassing Card to allow embedding in dialog
    <div>
        <CardHeader className="px-0 pt-0 pb-3">
            <CardDescription className="text-sm">Choose one or more topics you'd like to focus on. This will help tailor the session.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-60 pr-3"> {/* Adjust height as needed for dialog */}
            <div className="space-y-3">
                {availableTopics.map(topic => (
                <div key={topic} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors">
                    <Checkbox
                    id={`dialog-topic-${topic}`} // Ensure unique ID for dialog context
                    checked={selected.has(topic)}
                    onCheckedChange={() => toggleTopic(topic)}
                    className="h-5 w-5"
                    />
                    <Label htmlFor={`dialog-topic-${topic}`} className="font-normal text-md flex-1 cursor-pointer">{topic}</Label>
                </div>
                ))}
            </div>
            </ScrollArea>
        </CardContent>
        {/* Footer and buttons will be handled by the parent dialog */}
    </div>
  );
}
