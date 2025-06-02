
import { Rocket } from "lucide-react";

export default function LaunchingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <Rocket className="h-24 w-24 text-primary mb-8 animate-pulse" />
      <h1 className="text-5xl font-headline font-bold text-primary mb-4">
        Launching Soon!
      </h1>
      <p className="text-xl text-foreground/80 mb-2">
        We are working hard to bring you something amazing.
      </p>
      <p className="text-muted-foreground">
        Stay tuned for updates!
      </p>
    </div>
  );
}
