"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PromotionalContentPage() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    contentType: 'text',
    file: null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    promoCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      contentType: value,
      file: null // Reset file when content type changes
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData(prevData => ({
      ...prevData,
      file: file
    }));
  };

  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    setFormData(prevData => ({
      ...prevData,
      [field]: date || null
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Implement submission logic here (e.g., send to backend)
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Promotional Content Management</h1>
        <p className="text-muted-foreground mt-1">This page will be used to manage promotional content.</p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add/Edit Promotional Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={formData.contentType} onValueChange={handleSelectChange} required>
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" value={formData.body} onChange={handleInputChange} required />
            </div>

            {formData.contentType !== 'text' && (
              <div className="space-y-2">
                <Label htmlFor="file">{formData.contentType === 'image' ? 'Image' : 'Video'} File</Label>
                <Input id="file" type="file" onChange={handleFileChange} accept={formData.contentType === 'image' ? 'image/*' : 'video/*'} required={!formData.file} />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate || undefined}
                      onSelect={(date) => handleDateChange(date, 'startDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate || undefined}
                      onSelect={(date) => handleDateChange(date, 'endDate')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo Code</Label>
              <Input id="promoCode" value={formData.promoCode} onChange={handleInputChange} />
            </div>

            <Button type="submit">Save Promotional Content</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}