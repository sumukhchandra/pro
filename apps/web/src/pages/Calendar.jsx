import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarWidget from '../components/CalendarWidget';

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/api/calendar', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const events = await response.json();
          const remindersByDate = events.reduce((acc, event) => {
            const date = new Date(event.date).toDateString();
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(event.reminder);
            return acc;
          }, {});
          setReminders(remindersByDate);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddReminder = async (reminder) => {
    const token = localStorage.getItem('token');
    const dateString = date.toDateString();
    try {
        const response = await fetch('http://localhost:3001/api/calendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ date: date, reminder: reminder }),
        });
        if(response.ok) {
            setReminders((prevReminders) => ({
                ...prevReminders,
                [dateString]: [...(prevReminders[dateString] || []), reminder],
            }));
        }
    } catch (error) {
        console.error('Failed to add reminder:', error);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toDateString();
      if (reminders[dateString]) {
        return <div className="h-2 w-2 bg-blue-500 rounded-full mx-auto"></div>;
      }
    }
    return null;
  };

  return (
    <div className="flex p-4 space-x-4">
      <div className="w-2/3">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileContent={tileContent}
            className="w-full border-0"
          />
        </div>
      </div>
      <div className="w-1/3">
        <CalendarWidget
          date={date}
          reminders={reminders[date.toDateString()] || []}
          onAddReminder={handleAddReminder}
        />
      </div>
    </div>
  );
};

export default CalendarPage;