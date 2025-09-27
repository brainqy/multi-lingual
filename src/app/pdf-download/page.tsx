
"use client"
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react';
 
const PdfViewerClient = dynamic(() => import('./PdfViewerClient'), { 
  ssr: false,
  loading: () => <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin"/></div>
})
 
export default function Page() {
  return <PdfViewerClient />
}
