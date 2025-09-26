// src/app/(app)/resume/page.tsx
'use client';
import { resume } from '@/lib/constants';
import { PDFViewer, ResumeDocument } from '@/components/pdf';

export default function ResumePage() {
  return (
    <PDFViewer className='min-h-screen w-full'>
      <ResumeDocument resume={resume} />
    </PDFViewer>
  );
}
