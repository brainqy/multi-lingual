import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-translation.ts';
import '@/ai/flows/identify-resume-issues.ts';
import '@/ai/flows/rewrite-resume-with-fixes.ts';
import '@/ai/flows/evaluate-daily-challenge-answer.ts';
