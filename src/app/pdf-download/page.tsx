import { ResumesDocument } from "@/components/features/resume-builder/pdf/resume/document";
import { PDFViewer } from "@/components/pdf";

export default function PdfDownloadPage() {
    return 
    (
    <PDFViewer className='min-h-screen w-full'>
        <ResumesDocument />
    </PDFViewer>
    );
}