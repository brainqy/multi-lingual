"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function PromotionalContentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Promotional Content Management</h1>
        <p className="text-muted-foreground mt-1">This page will be used to manage promotional content.</p>
      </div>

      <Card className="text-center py-12 shadow-lg">
        <CardHeader>
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription>
            Functionality for managing promotional content will be available here in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for future content management components */}
        </CardContent>
      </Card>
    </div>
  );
}