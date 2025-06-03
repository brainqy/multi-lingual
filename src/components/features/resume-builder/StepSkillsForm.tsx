"use client";

import type React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StepSkillsFormProps {
  data: string[];
  onUpdate: (skills: string[]) => void;
}

export default function StepSkillsForm({ data, onUpdate }: StepSkillsFormProps) {
  const skillsText = data.join(", ");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSkills = e.target.value.split(",").map(skill => skill.trim()).filter(skill => skill);
    onUpdate(newSkills);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="skills">Skills</Label>
      <Textarea
        id="skills"
        value={skillsText}
        onChange={handleChange}
        placeholder="Enter your skills, separated by commas (e.g., JavaScript, React, Project Management, Python)"
        rows={6}
      />
      <p className="text-xs text-slate-500">Separate skills with commas. You can include both technical and soft skills.</p>
    </div>
  );
}