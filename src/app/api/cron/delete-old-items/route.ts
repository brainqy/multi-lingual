
import { NextResponse } from 'next/server';
import { cleanTrash } from '@/lib/actions/trash';
import { logAction, logError } from '@/lib/logger';

// THIS ROUTE IS DEPRECATED AND NO LONGER USED BY CRON.JSON
// Logic has been moved to the master cron handler at /api/cron/daily
// It is kept for potential manual triggering or legacy purposes.
export async function GET() {
  try {
    logAction('[CRON_LEGACY] Starting scheduled job: cleanTrash');
    const result = await cleanTrash();
    if (result.success) {
      logAction('[CRON_LEGACY] Finished scheduled job: cleanTrash', { count: result.count });
      return NextResponse.json({ success: true, deletedCount: result.count });
    } else {
      logError('[CRON_LEGACY] Failed scheduled job: cleanTrash', new Error(result.error), {});
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    logError('[CRON_LEGACY] Exception in scheduled job: cleanTrash', error, {});
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during the cron job.' }, { status: 500 });
  }
}
