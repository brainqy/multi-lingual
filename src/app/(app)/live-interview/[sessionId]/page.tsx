import LiveInterviewClientView from '@/components/features/live-interview/LiveInterviewClientView';

// By removing generateStaticParams, this page will be dynamically rendered
// at request time, which may help with build errors.
// import { sampleLiveInterviewSessions } from '@/lib/sample-data';
// export async function generateStaticParams() {
//   return sampleLiveInterviewSessions.map((session) => ({
//     sessionId: session.id,
//   }));
// }

// The page component itself is now a Server Component that wraps the client view.
export default function LiveInterviewPageWrapper() {
  // The client component will use `useParams` to get the sessionId, so we don't need to pass props.
  return <LiveInterviewClientView />;
}
