import React from 'react';

interface InterviewQuestionDisplayProps {
  question: string;
}

const InterviewQuestionDisplay: React.FC<InterviewQuestionDisplayProps> = ({ question }) => {
  return (
    <div className="p-6 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Today's Interview Challenge</h3>
      <p className="text-gray-700">{question}</p>
    </div>
  );
};

export default InterviewQuestionDisplay;