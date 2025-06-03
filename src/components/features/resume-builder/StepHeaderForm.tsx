"use client";

import type React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeHeaderData } from "@/types";

interface StepHeaderFormProps {
  data: ResumeHeaderData;
  onUpdate: (data: Partial<ResumeHeaderData>) => void;
}

export default function StepHeaderForm({ data, onUpdate }: StepHeaderFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={data.fullName} onChange={handleChange} placeholder="e.g., Jane Doe" required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={data.email} onChange={handleChange} placeholder="e.g., jane.doe@example.com" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" value={data.phone} onChange={handleChange} placeholder="e.g., (555) 123-4567" required />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
          <Input id="linkedin" name="linkedin" type="url" value={data.linkedin} onChange={handleChange} placeholder="e.g., linkedin.com/in/janedoe" />
        </div>
      </div>
      <div>
        <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
        <Input id="portfolio" name="portfolio" type="url" value={data.portfolio || ""} onChange={handleChange} placeholder="e.g., github.com/janedoe or janedoe.com" />
      </div>
      <div>
        <Label htmlFor="address">Address (Optional)</Label>
        <Input id="address" name="address" value={data.address || ""} onChange={handleChange} placeholder="e.g., City, State" />
      </div>
    </div>
  );
}