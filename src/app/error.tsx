
"use client"; 

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <AlertTriangle className="h-20 w-20 text-destructive mb-6" />
      <h1 className="text-4xl font-headline font-bold text-destructive mb-3">
        Something went wrong!
      </h1>
      <p className="text-lg text-foreground/80 mb-6 max-w-md">
        We encountered an unexpected issue. Please try again, or contact support if the problem persists.
      </p>
      {error?.message && (
         <p className="text-sm text-muted-foreground mb-6 bg-muted p-3 rounded-md max-w-xl">Error details: {error.message}</p>
      )}
      <Button onClick={() => reset()} size="lg">
        <RotateCcw className="mr-2 h-5 w-5" />
        Try Again
      </Button>
    </div>
  );
}
