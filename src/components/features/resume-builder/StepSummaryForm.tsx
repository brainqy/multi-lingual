"use client";

import type React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StepSummaryFormProps {
  data: string;
  onUpdate: (summary: string) => void;
}

export default function StepSummaryForm({ data, onUpdate }: StepSummaryFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="summary">Professional Summary</Label>
      <Textarea
        id="summary"
        value={data}
        onChange={handleChange}
        placeholder="Write a brief summary (2-4 sentences) highlighting your key qualifications, experience, and career goals. Tailor this to the type of job you are applying for."
        rows={8}
      />
      <p className="text-xs text-slate-500">This is your chance to make a strong first impression. Focus on your most relevant achievements and skills.</p>
    </div>
  );
}