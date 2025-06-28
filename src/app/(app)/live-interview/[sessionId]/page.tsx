
import LiveInterviewClientView from '@/components/features/live-interview/LiveInterviewClientView';
import { sampleLiveInterviewSessions } from '@/lib/sample-data';

// This function generates the static paths for each live interview session at build time.
export async function generateStaticParams() {
  return sampleLiveInterviewSessions.map((session) => ({
    sessionId: session.id,
  }));
}

// The page component itself is now a Server Component that wraps the client view.
export default function LiveInterviewPageWrapper() {
  // The client component will use `useParams` to get the sessionId, so we don't need to pass props.
  return <LiveInterviewClientView />;
}
