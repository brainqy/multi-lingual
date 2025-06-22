import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-translation.ts';
import '@/ai/flows/identify-resume-issues.ts';
import '@/ai/flows/rewrite-resume-with-fixes.ts';
