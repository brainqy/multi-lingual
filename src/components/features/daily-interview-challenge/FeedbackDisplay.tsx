import React from 'react';

interface FeedbackDisplayProps {
  feedback: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">AI Feedback:</h3>
      <p className="text-gray-700">{feedback}</p>
    </div>
  );
};

export default FeedbackDisplay;