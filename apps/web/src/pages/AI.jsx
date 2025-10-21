import React from 'react';

const AI = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">AI Relationship Assistant</h1>
        <p className="text-xl mb-8 text-gray-600">
          Coming soon! Get personalized suggestions and insights from our AI assistant.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Date Night Ideas</h2>
            <p className="text-gray-600">Stuck in a rut? Get creative and fun date night ideas tailored to your preferences.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Conversation Starters</h2>
            <p className="text-gray-600">Spark meaningful conversations with our AI-generated conversation starters.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Conflict Resolution</h2>
            <p className="text-gray-600">Our AI can help you navigate disagreements and find common ground.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AI;
