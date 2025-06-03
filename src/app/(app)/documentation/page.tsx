
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, Code2, Share2 } from "lucide-react";
import { sampleUserProfile } from "@/lib/sample-data";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

export default function DocumentationPage() {
  const currentUser = sampleUserProfile;

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BookText className="h-8 w-8" /> Documentation
      </h1>
      <CardDescription>
        Welcome to the ResumeMatch AI documentation. Here you'll find details about our platform's features and API.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-6 w-6 text-primary"/>Platform Features</CardTitle>
          <CardDescription>Overview of key features and how to use them.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="feature-resume-analyzer">
              <AccordionTrigger className="text-lg">Resume Analyzer</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>The Resume Analyzer uses AI to compare your resume against a job description. It provides a match score, highlights matching and missing skills, and offers suggestions for improvement.</p>
                <p><strong>How to use:</strong> Navigate to the "Resume Analyzer" page, upload or select your resume, paste the job description, and click "Analyze".</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feature-job-tracker">
              <AccordionTrigger className="text-lg">Job Tracker</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>The Job Tracker helps you manage your job applications in a Kanban-style board. You can track applications through stages like "Saved", "Applied", "Interview", and "Offer".</p>
                <p><strong>How to use:</strong> Add new job applications, move them between columns as your status changes, and add notes or relevant documents.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feature-alumni-connect">
              <AccordionTrigger className="text-lg">Alumni Connect</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Connect with fellow alumni for networking, mentorship, or collaboration. Search the directory, view profiles, and request appointments.</p>
                <p><strong>How to use:</strong> Use filters to find alumni by skills, company, or interests. View profiles and use coins to book appointments.</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="feature-community-feed">
              <AccordionTrigger className="text-lg">Community Feed</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Engage with the community by sharing updates, asking questions, creating polls, or posting events and requests.</p>
                <p><strong>How to use:</strong> Create new posts, interact with existing ones by liking or commenting. Admins can moderate content.</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="feature-gamification">
              <AccordionTrigger className="text-lg">Gamification (XP, Badges, Wallet)</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Earn XP points and badges by engaging with platform features. Your daily login streak also contributes to your progress.</p>
                <p>Use your digital wallet (coins) to book appointments or access premium features. Coins can be earned through referrals or specific achievements.</p>
                <p><strong>How to use:</strong> Participate actively on the platform to earn rewards. Check the "Rewards & Progress" and "Digital Wallet" pages for your status.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Code2 className="h-6 w-6 text-primary"/>API Documentation (Conceptual)</CardTitle>
          <CardDescription>Information for developers looking to integrate with ResumeMatch AI. (These are conceptual examples and not yet live endpoints).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our API documentation is currently under development. Below are conceptual examples of how our API might work.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="api-auth">
              <AccordionTrigger className="text-md font-semibold">User Authentication API</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p><strong>Endpoint:</strong> <code>POST /api/auth/login</code></p>
                <p><strong>Description:</strong> Authenticates a user and returns a session token.</p>
                <p className="font-medium text-card-foreground">Request Payload (application/json):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}</code></pre>
                <p className="font-medium text-card-foreground">Success Response (200 OK):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "Jane Doe",
    "email": "user@example.com",
    "role": "user"
  }
}`}</code></pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-resume-analysis">
              <AccordionTrigger className="text-md font-semibold">Resume Analysis API</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p><strong>Endpoint:</strong> <code>POST /api/resumes/analyze</code></p>
                <p><strong>Description:</strong> Analyzes a resume against a job description using the detailed schema.</p>
                <p className="font-medium text-card-foreground">Request Payload (application/json):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "resumeText": "Full text of the user's resume...",
  "jobDescriptionText": "Full text of the job description..."
}`}</code></pre>
                <p className="font-medium text-card-foreground">Success Response (200 OK) - Example Snippet:</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "hardSkillsScore": 75,
  "matchingSkills": ["JavaScript", "React"],
  "missingSkills": ["TypeScript", "GraphQL"],
  "resumeKeyStrengths": "Strong experience in full-stack development...",
  "jobDescriptionKeyRequirements": "Requires expertise in TypeScript...",
  "overallQualityScore": 80,
  "recruiterTips": [
    {
      "category": "Word Count",
      "finding": "Resume word count is within the optimal range.",
      "status": "positive"
    }
  ],
  "overallFeedback": "The resume is a good starting point but could be improved by highlighting TypeScript skills.",
  "searchabilityScore": 90,
  "searchabilityDetails": {
    "hasPhoneNumber": true,
    "hasEmail": true,
    "hasAddress": false,
    "jobTitleMatchesJD": true,
    "hasWorkExperienceSection": true,
    "hasEducationSection": true,
    "hasProfessionalSummary": true,
    "keywordDensityFeedback": "Good keyword density for core requirements."
  },
  "quantifiableAchievementDetails": {
    "score": 70,
    "examplesFound": ["Increased sales by 15%"],
    "areasLackingQuantification": ["Managed a team of developers (consider specifying team size or project impact)."]
  },
  "actionVerbDetails": {
    "score": 85,
    "strongVerbsUsed": ["Led", "Developed", "Implemented"],
    "weakVerbsUsed": ["Responsible for"],
    "suggestedStrongerVerbs": [{"original": "Responsible for", "suggestion": "Managed"}]
  },
  "impactStatementDetails": {
    "clarityScore": 80,
    "exampleWellWrittenImpactStatements": ["Achieved a 20% reduction in bug reports by implementing a new testing strategy."]
  },
  "readabilityDetails": {
    "fleschKincaidGradeLevel": 10.5,
    "fleschReadingEase": 65.2,
    "readabilityFeedback": "The resume is generally easy to read."
  },
  "atsParsingConfidence": {
    "overall": 88
  },
  "atsStandardFormattingComplianceScore": 92,
  "standardFormattingIssues": [
    { "issue": "Minor use of non-standard font in one section.", "recommendation": "Use standard fonts like Arial, Calibri, or Times New Roman throughout."}
  ],
  "undefinedAcronyms": ["JIRA (Consider defining if not universally known in context)"]
  // ... other fields from AnalyzeResumeAndJobDescriptionOutput might be present
}`}</code></pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-job-postings">
              <AccordionTrigger className="text-md font-semibold">Job Postings API</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p><strong>Endpoint:</strong> <code>GET /api/jobs</code></p>
                <p><strong>Description:</strong> Retrieves a list of job openings.</p>
                <p className="font-medium text-card-foreground">Query Parameters (Optional):</p>
                <ul className="list-disc list-inside text-xs">
                  <li><code>keywords</code> (string): Search by keywords.</li>
                  <li><code>location</code> (string): Filter by location.</li>
                  <li><code>limit</code> (number): Number of results to return.</li>
                  <li><code>offset</code> (number): Offset for pagination.</li>
                </ul>
                <p className="font-medium text-card-foreground">Success Response (200 OK):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`[
  {
    "id": "job-abc-123",
    "title": "Senior Frontend Developer",
    "company": "Innovate Solutions",
    "location": "Remote",
    "datePosted": "2024-07-25",
    "type": "Full-time",
    "descriptionSnippet": "Seeking an experienced Frontend Developer..."
  },
  // ... more job openings
]`}</code></pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-community-feed">
              <AccordionTrigger className="text-md font-semibold">Community Feed API</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p><strong>Endpoint:</strong> <code>POST /api/feed/posts</code></p>
                <p><strong>Description:</strong> Creates a new post in the community feed.</p>
                 <p className="font-medium text-card-foreground">Request Payload (application/json):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "content": "Excited to share my latest project! Check it out...",
  "tags": ["project", "showcase", "webdev"],
  "type": "text"
}`}</code></pre>
                <p className="font-medium text-card-foreground">Success Response (201 Created):</p>
                <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>{`{
  "id": "post-xyz-789",
  "userId": "user-123",
  "userName": "Jane Doe",
  "timestamp": "2024-07-26T10:00:00Z",
  "content": "Excited to share my latest project! Check it out...",
  "type": "text",
  "tags": ["project", "showcase", "webdev"],
  "likes": 0,
  "commentsCount": 0
}`}</code></pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
