import React from 'react';

const Games = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Games for Two</h1>
        <p className="text-xl mb-8 text-gray-600">
          Coming soon! A selection of fun and engaging games designed to play with your partner.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">20 Questions</h2>
            <p className="text-gray-600">Get to know each other better with a classic game of 20 questions.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Would You Rather?</h2>
            <p className="text-gray-600">A fun way to spark conversation and learn about your partner's preferences.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Story Builder</h2>
            <p className="text-gray-600">Create a story together, one sentence at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
