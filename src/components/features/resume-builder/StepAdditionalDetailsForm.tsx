
"use client";

import type React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ResumeBuilderData } from '@/types';

interface StepAdditionalDetailsFormProps {
  data: ResumeBuilderData['additionalDetails'] | {}; // Allow an empty object
  onUpdate: (data: Partial<ResumeBuilderData['additionalDetails']>) => void;
}

export default function StepAdditionalDetailsForm({ data, onUpdate }: StepAdditionalDetailsFormProps) {
  
  const currentData = 'awards' in data ? data : { awards: '', certifications: '', languages: '', interests: '' };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="awards">Awards & Recognitions (Optional, one per line)</Label>
        <Textarea
          id="awards"
          name="awards"
          value={currentData.awards || ""}
          onChange={handleChange}
          placeholder="- Employee of the Month, Tech Solutions Inc. (2023)&#10;- Dean's List, State University (2017)"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="certifications">Certifications & Licenses (Optional, one per line)</Label>
        <Textarea
          id="certifications"
          name="certifications"
          value={currentData.certifications || ""}
          onChange={handleChange}
          placeholder="- AWS Certified Solutions Architect - Associate (2022)&#10;- Project Management Professional (PMP)"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="languages">Languages (Optional, one per line with proficiency)</Label>
        <Textarea
          id="languages"
          name="languages"
          value={currentData.languages || ""}
          onChange={handleChange}
          placeholder="- English (Native)&#10;- Spanish (Conversational)&#10;- French (Basic)"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="interests">Interests & Hobbies (Optional, comma-separated)</Label>
        <Textarea
          id="interests"
          name="interests"
          value={currentData.interests || ""}
          onChange={handleChange}
          placeholder="e.g., Hiking, Photography, Open Source Contributions, Chess"
          rows={3}
        />
      </div>
      <p className="text-xs text-slate-500">Include sections that are relevant to the jobs you are applying for.</p>
    </div>
  );
}
