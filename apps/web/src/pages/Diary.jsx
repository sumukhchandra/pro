import React, { useState, useEffect } from 'react';
import DiaryBook from '../components/DiaryBook';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Diary = () => {
  const [diaryType, setDiaryType] = useState('personal'); // 'personal' or 'common'
  const [personalDiaryContent, setPersonalDiaryContent] = useState({});
  const [commonDiaryContent, setCommonDiaryContent] = useState({});

  useEffect(() => {
    const fetchDiaryEntries = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/api/diary', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const entries = await response.json();
          const personalEntries = entries.filter(e => e.type === 'personal').reduce((acc, cur) => ({ ...acc, [cur.date]: cur.content }), {});
          const commonEntries = entries.filter(e => e.type === 'common').reduce((acc, cur) => ({ ...acc, [cur.date]: cur.content }), {});
          setPersonalDiaryContent(personalEntries);
          setCommonDiaryContent(commonEntries);
        }
      } catch (error) {
        console.error('Failed to fetch diary entries:', error);
      }
    };

    fetchDiaryEntries();
  }, []);

  const handleDiaryTypeChange = (type) => {
    setDiaryType(type);
  };

  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntryContent, setNewEntryContent] = useState('');

  const handleAddNewEntry = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newEntryDate, content: newEntryContent, type: diaryType }),
      });
      if (response.ok) {
        const newEntry = await response.json();
        if (diaryType === 'personal') {
          setPersonalDiaryContent({ ...personalDiaryContent, [newEntry.date]: newEntry.content });
        } else {
          setCommonDiaryContent({ ...commonDiaryContent, [newEntry.date]: newEntry.content });
        }
        setNewEntryContent('');
      }
    } catch (error) {
      console.error('Failed to add diary entry:', error);
    }
  };

  const content = diaryType === 'personal' ? personalDiaryContent : commonDiaryContent;

  return (
    <div className="flex p-4 space-x-4">
      <div className="w-2/3">
        <div className="flex justify-center mb-4">
          <button
            className={`mx-2 px-4 py-2 rounded-full font-semibold ${diaryType === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => handleDiaryTypeChange('personal')}
          >
            Personal Diary
          </button>
          <button
            className={`mx-2 px-4 py-2 rounded-full font-semibold ${diaryType === 'common' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => handleDiaryTypeChange('common')}
          >
            Common Diary
          </button>
        </div>
        <DiaryBook content={content} />
      </div>
      <div className="w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">New Entry</h3>
          <form onSubmit={handleAddNewEntry} className="space-y-4">
            <input type="date" className="w-full border p-2 rounded-md" value={newEntryDate} onChange={(e) => setNewEntryDate(e.target.value)} required/>
            <ReactQuill theme="snow" value={newEntryContent} onChange={setNewEntryContent} />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Add Entry</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Diary;