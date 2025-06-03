"use client";

import type React from 'react';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ResumeEducationEntry } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { graduationYears } from '@/lib/sample-data';
import { DegreePrograms } from '@/types'; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


interface StepEducationFormProps {
  data: ResumeEducationEntry[];
  onUpdate: (data: ResumeEducationEntry[]) => void;
}

export default function StepEducationForm({ data, onUpdate }: StepEducationFormProps) {
  const [entries, setEntries] = useState<ResumeEducationEntry[]>(data.length > 0 ? data : [{ id: Date.now().toString(), degree: '', university: '', location: '', graduationYear: '', details: '' }]);

  const handleChange = (index: number, field: keyof ResumeEducationEntry, value: string) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
    onUpdate(newEntries);
  };
  
  const handleSelectChange = (index: number, field: keyof ResumeEducationEntry, value: string) => {
    const newEntries = [...entries];
    (newEntries[index] as any)[field] = value;
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  const addEntry = () => {
    const newEntries = [...entries, { id: Date.now().toString(), degree: '', university: '', location: '', graduationYear: '', details: '' }];
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <div key={entry.id} className="space-y-4 p-4 border rounded-md shadow-sm bg-slate-50 relative">
          {entries.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeEntry(index)}
              className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
              aria-label="Remove education entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`degree-${index}`}>Degree/Program</Label>
              <Select value={entry.degree} onValueChange={(value) => handleSelectChange(index, 'degree', value)}>
                <SelectTrigger id={`degree-${index}`}>
                  <SelectValue placeholder="Select degree/program" />
                </SelectTrigger>
                <SelectContent>
                  {DegreePrograms.map(deg => <SelectItem key={deg} value={deg}>{deg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`major-${index}`}>Major/Field of Study (Optional)</Label>
              <Input id={`major-${index}`} value={entry.major || ""} onChange={(e) => handleChange(index, 'major', e.target.value)} placeholder="e.g., Computer Science" />
            </div>
          </div>
          <div>
            <Label htmlFor={`university-${index}`}>University/Institution</Label>
            <Input id={`university-${index}`} value={entry.university} onChange={(e) => handleChange(index, 'university', e.target.value)} placeholder="e.g., State University" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`location-${index}`}>Location</Label>
              <Input id={`location-${index}`} value={entry.location} onChange={(e) => handleChange(index, 'location', e.target.value)} placeholder="e.g., City, State" />
            </div>
            <div>
              <Label htmlFor={`graduationYear-${index}`}>Graduation Year</Label>
              <Select value={entry.graduationYear} onValueChange={(value) => handleSelectChange(index, 'graduationYear', value)}>
                <SelectTrigger id={`graduationYear-${index}`}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {graduationYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor={`details-${index}`}>Additional Details (Optional, one per line)</Label>
            <Textarea id={`details-${index}`} value={entry.details || ""} onChange={(e) => handleChange(index, 'details', e.target.value)} rows={3} placeholder="- Dean's List&#10;- Relevant Coursework: Advanced Algorithms" />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addEntry} className="border-slate-400 text-slate-700 hover:bg-slate-100">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Education
      </Button>
    </div>
  );
}