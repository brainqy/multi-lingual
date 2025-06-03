"use client";

import type React from 'react';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResumeExperienceEntry } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";

interface StepExperienceFormProps {
  data: ResumeExperienceEntry[];
  onUpdate: (data: ResumeExperienceEntry[]) => void;
}

export default function StepExperienceForm({ data, onUpdate }: StepExperienceFormProps) {
  const [entries, setEntries] = useState<ResumeExperienceEntry[]>(data.length > 0 ? data : [{ id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }]);

  const handleChange = (index: number, field: keyof ResumeExperienceEntry, value: string | boolean) => {
    const newEntries = [...entries];
    if (typeof value === 'boolean' && field === 'isCurrent') {
      newEntries[index].isCurrent = value;
      if (value) newEntries[index].endDate = 'Present'; // Auto-fill if current
    } else if (typeof value === 'string') {
      (newEntries[index] as any)[field] = value;
      if(field === 'endDate' && newEntries[index].isCurrent && value !== 'Present') {
        newEntries[index].isCurrent = false; // Uncheck if end date is not 'Present'
      }
    }
    setEntries(newEntries);
    onUpdate(newEntries);
  };

  const addEntry = () => {
    const newEntries = [...entries, { id: Date.now().toString(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }];
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
              aria-label="Remove experience entry"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
              <Input id={`jobTitle-${index}`} value={entry.jobTitle} onChange={(e) => handleChange(index, 'jobTitle', e.target.value)} placeholder="e.g., Software Engineer" />
            </div>
            <div>
              <Label htmlFor={`company-${index}`}>Company</Label>
              <Input id={`company-${index}`} value={entry.company} onChange={(e) => handleChange(index, 'company', e.target.value)} placeholder="e.g., Tech Solutions Inc." />
            </div>
          </div>
          <div>
            <Label htmlFor={`location-${index}`}>Location</Label>
            <Input id={`location-${index}`} value={entry.location} onChange={(e) => handleChange(index, 'location', e.target.value)} placeholder="e.g., City, State or Remote" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor={`startDate-${index}`}>Start Date</Label>
              <Input id={`startDate-${index}`} type="month" value={entry.startDate} onChange={(e) => handleChange(index, 'startDate', e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`endDate-${index}`}>End Date</Label>
              <Input id={`endDate-${index}`} type={entry.isCurrent ? "text" : "month"} value={entry.isCurrent ? "Present" : entry.endDate} onChange={(e) => handleChange(index, 'endDate', e.target.value)} disabled={entry.isCurrent}/>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id={`isCurrent-${index}`} checked={entry.isCurrent} onCheckedChange={(checked) => handleChange(index, 'isCurrent', Boolean(checked))} />
            <Label htmlFor={`isCurrent-${index}`} className="font-normal">I currently work here</Label>
          </div>
          <div>
            <Label htmlFor={`responsibilities-${index}`}>Responsibilities & Achievements (one per line)</Label>
            <Textarea id={`responsibilities-${index}`} value={entry.responsibilities} onChange={(e) => handleChange(index, 'responsibilities', e.target.value)} rows={4} placeholder="- Developed new features for X product&#10;- Led a team of Y developers&#10;- Increased Z by N%" />
            <p className="text-xs text-slate-500 mt-1">Start each bullet point with a hyphen (-) or use action verbs.</p>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addEntry} className="border-slate-400 text-slate-700 hover:bg-slate-100">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Another Experience
      </Button>
    </div>
  );
}