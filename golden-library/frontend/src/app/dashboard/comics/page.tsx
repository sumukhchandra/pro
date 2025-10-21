'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImageURL: string;
  description: string;
  tags: string[];
}

export default function ComicsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [mostLiked, setMostLiked] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBooks();
    fetchMostLiked();
  }, [sortBy, sortOrder]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/content?type=comic&sortBy=${sortBy}&order=${sortOrder}`
      );
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching comics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMostLiked = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/content/most-liked?type=comic');
      const data = await response.json();
      setMostLiked(data);
    } catch (error) {
      console.error('Error fetching most liked comics:', error);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/saved/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Book saved successfully');
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const BookCard = ({ book, isLarge = false }: { book: Book, isLarge?: boolean }) => (
    <div className={`book-card ${isLarge ? 'w-64' : 'w-48'}`}>
      <div className="relative overflow-hidden">
        <Image
          src={book.coverImageURL}
          alt={book.title}
          width={isLarge ? 256 : 192}
          height={isLarge ? 384 : 288}
          className="book-cover w-full h-64 object-cover"
        />
        <button
          onClick={() => handleSaveBook(book._id)}
          className="absolute top-2 right-2 p-2 bg-golden-500 text-dark-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-golden-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className={`font-semibold text-white mb-1 line-clamp-2 ${isLarge ? 'text-lg' : 'text-sm'}`}>
          {book.title}
        </h3>
        <p className={`text-dark-400 mb-2 ${isLarge ? 'text-sm' : 'text-xs'}`}>
          by {book.author}
        </p>
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-golden-500/20 text-golden-500 text-xs rounded-full"
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
        <div className="animate-pulse text-golden-500 text-xl">Loading comics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-golden-500 mb-4">
            Comics
          </h1>
          
          {/* Sorting Options */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-dark-300 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm py-2 px-3"
              >
                <option value="createdAt">Newest</option>
                <option value="title">A-Z</option>
                <option value="author">Author</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-dark-300 text-sm">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field text-sm py-2 px-3"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Most Liked Section */}
        {mostLiked.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-semibold text-golden-500 mb-6">
              Most Liked Comics
            </h2>
            <div className="carousel-container">
              <div className="carousel-track">
                {mostLiked.map((book) => (
                  <div key={book._id} className="flex-shrink-0 w-64 mx-2">
                    <BookCard book={book} isLarge={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Comics Grid */}
        <div>
          <h2 className="text-2xl font-serif font-semibold text-golden-500 mb-6">
            All Comics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>

        {books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-dark-700 mb-4">🦸</div>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">No comics found</h3>
            <p className="text-dark-400">Check back later for new additions to our collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}