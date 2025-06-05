// src/app/(app)/daily-interview-challenge/page.tsx

import React from 'react';
import sampleChallenges from '@/lib/sample-challenges'; // Import sampleChallenges

const DailyInterviewChallengePage: React.FC = () => {
  const dailyChallenge = sampleChallenges[0]; // Get the first challenge

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Interview Challenge</h1>
      {/* Container for future components like question display, response area, feedback, etc. */}
      <div className="daily-challenge-container">
        <h2>{dailyChallenge.title}</h2> {/* Display challenge title */}
        <p>{dailyChallenge.description}</p> {/* Display challenge description */}
      </div>
    </div>
  );
};

export default DailyInterviewChallengePage;
