
import { NextResponse } from 'next/server';
import { createActivity } from '@/lib/actions/activities';
import { logAction, logError } from '@/lib/logger';

export async function GET() {
  try {
    logAction('[CRON_ROUTE] /api/cron/every-two-minutes invoked.');
    
    // As a demo, let's create a system-level activity
    await createActivity({
        tenantId: 'platform', // System-level activity
        description: 'Scheduled 2-minute cron job executed successfully.',
        // No userId for a system cron job
    });

    logAction('[CRON_ROUTE] /api/cron/every-two-minutes finished successfully.');
    return NextResponse.json({ success: true, message: "2-minute cron job executed and activity logged." });
  } catch (error) {
    logError('[CRON_ROUTE] Exception in /api/cron/every-two-minutes', error, {});
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during the cron job.' }, { status: 500 });
  }
}
