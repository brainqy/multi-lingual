'use client';
import { resume } from '@/lib/constants';
import { PDFViewer } from '@/components/pdf';
import { ResumesDocument } from '@/components/features/resume-builder/pdf/resume/document';

export default function ResumePage() {
  return (
    <PDFViewer className='min-h-screen w-full'>
      <ResumesDocument />
    </PDFViewer>
  );
}
