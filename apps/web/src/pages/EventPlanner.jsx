import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    question: 'What type of date?',
    answers: ['Dinner', 'Movie', 'Coffee'],
  },
  {
    question: 'What is your budget?',
    answers: ['$', '$$', '$$$'],
  },
  {
    question: 'What time?',
    answers: ['Evening', 'Afternoon', 'Morning'],
  },
];

const EventPlanner = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleAddToCalendar = async () => {
    const token = localStorage.getItem('token');
    const reminder = `Event: ${answers.join(' - ')}`;
    try {
      const response = await fetch('http://localhost:3001/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date: new Date(), reminder }),
      });
      if (response.ok) {
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Failed to add event to calendar:', error);
    }
  };

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Perfect Date</h2>
          <ul className="space-y-4">
            {answers.map((answer, index) => (
              <li key={index} className="text-lg text-gray-700">
                <strong className="font-semibold">{questions[index].question}:</strong> {answer}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-gray-600">Fetching nearby places...</p>
          <button
            onClick={handleAddToCalendar}
            className="w-full mt-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{questions[currentQuestionIndex].question}</h2>
        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestionIndex].answers.map((answer) => (
            <button
              key={answer}
              className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-semibold text-gray-800 text-center"
              onClick={() => handleAnswer(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventPlanner;