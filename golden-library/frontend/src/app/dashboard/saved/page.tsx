'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImageURL: string;
  description: string;
  type: 'novel' | 'ebook' | 'comic' | 'manga';
  tags: string[];
}

export default function SavedPage() {
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedBooks();
  }, []);

  const fetchSavedBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/saved', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedBooks(data);
      }
    } catch (error) {
      console.error('Error fetching saved books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/saved/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSavedBooks(savedBooks.filter(book => book._id !== bookId));
      }
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const BookCard = ({ book }: { book: Book }) => (
    <div className="book-card">
      <div className="relative overflow-hidden">
        <Image
          src={book.coverImageURL}
          alt={book.title}
          width={200}
          height={300}
          className="book-cover w-full h-64 object-cover"
        />
        <button
          onClick={() => handleRemoveBook(book._id)}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
          title="Remove from saved list"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-dark-400 text-xs mb-2">
          by {book.author}
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block px-2 py-1 bg-golden-500/20 text-golden-500 text-xs rounded-full">
            {book.type}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse text-golden-500 text-xl">Loading your saved books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-golden-500 mb-4">
            Your Saved List
          </h1>
          <p className="text-dark-300">
            {savedBooks.length} {savedBooks.length === 1 ? 'book' : 'books'} saved
          </p>
        </div>

        {/* Saved Books Grid */}
        {savedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {savedBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl text-dark-700 mb-4">📖</div>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">No saved books yet</h3>
            <p className="text-dark-400 mb-6">
              Start exploring our collection and save books you'd like to read later.
            </p>
            <a
              href="/dashboard"
              className="btn-primary inline-flex items-center"
            >
              Browse Books
            </a>
          </div>
        )}
      </div>
    </div>
  );
}