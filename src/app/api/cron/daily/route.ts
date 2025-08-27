
import { NextResponse } from 'next/server';
import { runDailyCronJobs } from '@/lib/actions/cron';
import { logAction, logError } from '@/lib/logger';

export async function GET() {
  try {
    logAction('[CRON_ROUTE] /api/cron/daily invoked.');
    const result = await runDailyCronJobs();
    logAction('[CRON_ROUTE] /api/cron/daily finished successfully.');
    return NextResponse.json({ success: true, result });
  } catch (error) {
    logError('[CRON_ROUTE] Exception in /api/cron/daily', error, {});
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during the cron job.' }, { status: 500 });
  }
}
