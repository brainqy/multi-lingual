
"use client";
import React, { useEffect, useRef } from 'react';
import { PDFViewer } from '@/components/pdf';
import ResumePDFDocument from './pdf/ResumePDFDocument';
import type { ResumeBuilderData } from '@/types';

const ClientPDFPreview = ({ data }: { data: ResumeBuilderData }) => {
  const keyRef = useRef(0);
  useEffect(() => {
    keyRef.current += 1;
  }, [data]);

  return (
    <PDFViewer key={keyRef.current} className="w-full h-full">
      <ResumePDFDocument data={data} />
    </PDFViewer>
  );
};

export default ClientPDFPreview;
