
import { HardHat } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <HardHat className="h-24 w-24 text-accent mb-8 animate-bounce" />
      <h1 className="text-5xl font-headline font-bold text-accent mb-4">
        Under Maintenance
      </h1>
      <p className="text-xl text-foreground/80 mb-2">
        Our site is currently undergoing scheduled maintenance.
      </p>
      <p className="text-muted-foreground">
        We should be back shortly. Thank you for your patience!
      </p>
    </div>
  );
}
