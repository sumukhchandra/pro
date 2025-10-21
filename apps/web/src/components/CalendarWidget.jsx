import React, { useState } from 'react';

const CalendarWidget = ({ date, reminders, onAddReminder }) => {
  const [reminderText, setReminderText] = useState('');

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (reminderText) {
      onAddReminder(reminderText);
      setReminderText('');
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">{date.toDateString()}</h3>
      <ul>
        {reminders.map((reminder, index) => (
          <li key={index}>{reminder}</li>
        ))}
      </ul>
      <form onSubmit={handleAddReminder} className="mt-4">
        <input
          type="text"
          className="w-full border p-2"
          placeholder="Add a reminder..."
          value={reminderText}
          onChange={(e) => setReminderText(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 mt-2">
          Add Reminder
        </button>
      </form>
    </div>
  );
};

export default CalendarWidget;