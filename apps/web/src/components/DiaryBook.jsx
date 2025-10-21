import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DiaryBook = ({ content }) => {
  const entries = Object.entries(content);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleNextPage = () => {
    if (currentPage < entries.length - 1) {
      setCurrentPage(currentPage + 2);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 2);
    }
  };

  const handleDateChange = (newDate) => {
    const dateString = newDate.toDateString();
    const entryIndex = entries.findIndex(([date]) => new Date(date).toDateString() === dateString);
    if (entryIndex !== -1) {
      setCurrentPage(entryIndex % 2 === 0 ? entryIndex : entryIndex - 1);
    }
    setShowCalendar(false);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl flex justify-end">
        <button className="p-2 rounded-full bg-gray-200 mb-2 hover:bg-gray-300" onClick={() => setShowCalendar(!showCalendar)}>
            📅
        </button>
       </div>
      {showCalendar && (
        <div className="absolute z-10">
            <Calendar
                onChange={handleDateChange}
                value={new Date(entries[currentPage]?.[0] || Date.now())}
            />
        </div>
      )}
      <div className="w-full max-w-4xl h-96 bg-white shadow-2xl flex rounded-lg">
        {/* Left Page */}
        <div key={currentPage} className="w-1/2 p-8 border-r-2 border-gray-300 bg-gray-50 rounded-l-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{entries[currentPage]?.[0]}</h2>
          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: entries[currentPage]?.[1] }} />
        </div>
        {/* Right Page */}
        <div key={currentPage + 1} className="w-1/2 p-8 bg-gray-50 rounded-r-lg">
          {entries[currentPage + 1] ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">{entries[currentPage + 1]?.[0]}</h2>
              <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: entries[currentPage + 1]?.[1] }} />
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-400">End of Diary</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button className="mx-2 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 font-semibold" onClick={handlePrevPage} disabled={currentPage === 0}>
          Previous
        </button>
        <button className="mx-2 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 font-semibold" onClick={handleNextPage} disabled={currentPage >= entries.length - 2}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DiaryBook;
