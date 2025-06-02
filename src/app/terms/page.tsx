
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
       <Link href="/" className="text-primary hover:underline mb-8 inline-block">&larr; Back to Home</Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-headline text-primary">
            <FileText className="h-8 w-8" />
            Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90 prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-headline text-xl text-primary">1. Agreement to Terms</h2>
          <p>
            By using Bhasha Setu (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="font-headline text-xl text-primary">2. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="font-headline text-xl text-primary">3. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Bhasha Setu and its licensors.
          </p>
          
          <h2 className="font-headline text-xl text-primary">4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="font-headline text-xl text-primary">5. Limitation Of Liability</h2>
          <p>
            In no event shall Bhasha Setu, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="font-headline text-xl text-primary">6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Our Jurisdiction, without regard to its conflict of law provisions.
          </p>

          <h2 className="font-headline text-xl text-primary">7. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>

          <h2 className="font-headline text-xl text-primary">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@bhashasetu.example.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
