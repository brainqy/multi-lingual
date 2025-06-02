
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block">&larr; Back to Home</Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-headline text-primary">
            <ShieldAlert className="h-8 w-8" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90 prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="font-headline text-xl text-primary">Introduction</h2>
          <p>
            Welcome to Bhasha Setu ("us", "we", or "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
          </p>

          <h2 className="font-headline text-xl text-primary">Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Bhasha Setu, express an interest in obtaining information about us or our products and services, when you participate in activities on the Bhasha Setu or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Bhasha Setu, the choices you make and the products and features you use. The personal information we collect may include the following: Name, Email Address, User Role.
          </p>

          <h2 className="font-headline text-xl text-primary">How We Use Your Information</h2>
          <p>
            We use personal information collected via our Bhasha Setu for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To facilitate account creation and logon process.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To respond to legal requests and prevent harm.</li>
          </ul>

          <h2 className="font-headline text-xl text-primary">Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>

          <h2 className="font-headline text-xl text-primary">How Long Do We Keep Your Information?</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
          </p>
          
          <h2 className="font-headline text-xl text-primary">Contact Us</h2>
          <p>
            If you have questions or comments about this policy, you may email us at privacy@bhashasetu.example.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
