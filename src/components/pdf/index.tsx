
'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Ubuntu',
  fonts: [
    {
      fontStyle: 'normal',
      fontWeight: 400,
      src: 'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgo6eA.ttf',
    },
    {
      fontStyle: 'italic',
      fontWeight: 400,
      src: 'https://fonts.gstatic.com/s/ubuntu/v20/4iCu6KVjbNBYlgoKeg7z.ttf',
    },
    {
      fontStyle: 'normal',
      fontWeight: 700,
      src: 'https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCxCvTtw.ttf',
    },
  ],
});

Font.register({
  family: 'Geist',
  fonts: [
    {
      fontStyle: 'normal',
      fontWeight: 400,
      src: 'https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf',
    },
    {
      fontStyle: 'normal',
      fontWeight: 700,
      src: 'https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMGYQMKR3pzfaWI_Re-Q4nQ.ttf',
    },
  ],
});

export { ResumeDocument } from '@/components/features/resume-builder/pdf/resume/document';

export const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> },
);

export const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button variant='default' disabled>
        <Loader2 className='animate-spin' />
        Loading...
      </Button>
    ),
  },
);
