'use client';
import { ResumesDocument } from "@/components/features/resume-builder/pdf/resume/document";
import { PDFViewer } from "@/components/pdf";
import { resume } from '@/lib/constants';

export default function PdfDownloadPage() {
    return (
    <PDFViewer className='min-h-screen w-full'>
        <ResumesDocument data={resume} />
    </PDFViewer>
    );
}
