
'use client';
import dynamic from 'next/dynamic';
import { PDFViewer } from '@/components/pdf';
import { Loader2 } from 'lucide-react';

const ResumesDocument = dynamic(() => import('@/components/features/resume-builder/pdf/ResumePDFDocument'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> 
});

export default function ResumePage() {
  return (
    <PDFViewer className='min-h-screen w-full'>
      <ResumesDocument data={null} />
    </PDFViewer>
  );
}
