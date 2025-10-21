'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImageURL: string;
  type: 'novel' | 'ebook' | 'comic' | 'manga';
}

export default function Dashboard() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [comics, setComics] = useState<Book[]>([]);
  const [manga, setManga] = useState<Book[]>([]);
  const [novels, setNovels] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const [featuredRes, comicsRes, mangaRes, novelsRes] = await Promise.all([
        fetch('http://localhost:5000/api/content?sortBy=createdAt&order=desc&limit=5'),
        fetch('http://localhost:5000/api/content?type=comic&limit=10'),
        fetch('http://localhost:5000/api/content?type=manga&limit=10'),
        fetch('http://localhost:5000/api/content?type=novel&limit=10')
      ]);

      const [featuredData, comicsData, mangaData, novelsData] = await Promise.all([
        featuredRes.json(),
        comicsRes.json(),
        mangaRes.json(),
        novelsRes.json()
      ]);

      setFeaturedBooks(featuredData);
      setComics(comicsData);
      setManga(mangaData);
      setNovels(novelsData);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
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
        // Show success message or update UI
        console.log('Book saved successfully');
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const BookCarousel = ({ books, title, type }: { books: Book[], title: string, type: string }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-serif font-semibold text-golden-500 mb-6">
        {title}
      </h2>
      <div className="carousel-container">
        <div className="carousel-track">
          {books.map((book) => (
            <div key={book._id} className="carousel-item">
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
                    onClick={() => handleSaveBook(book._id)}
                    className="absolute top-2 right-2 p-2 bg-golden-500 text-dark-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-golden-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-dark-400 text-xs mb-2">
                    {book.author}
                  </p>
                  <span className="inline-block px-2 py-1 bg-golden-500/20 text-golden-500 text-xs rounded-full">
                    {book.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse text-golden-500 text-xl">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Books Carousel */}
        <div className="mb-12">
          <h1 className="text-3xl font-serif font-bold text-golden-500 mb-8">
            Featured Books
          </h1>
          <div className="carousel-container">
            <div className="carousel-track">
              {featuredBooks.map((book) => (
                <div key={book._id} className="flex-shrink-0 w-80 mx-4">
                  <div className="book-card">
                    <div className="relative overflow-hidden">
                      <Image
                        src={book.coverImageURL}
                        alt={book.title}
                        width={320}
                        height={480}
                        className="book-cover w-full h-96 object-cover"
                      />
                      <button
                        onClick={() => handleSaveBook(book._id)}
                        className="absolute top-4 right-4 p-3 bg-golden-500 text-dark-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-golden-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-serif font-semibold text-white mb-2">
                        {book.title}
                      </h2>
                      <p className="text-dark-400 mb-4">
                        by {book.author}
                      </p>
                      <span className="inline-block px-3 py-1 bg-golden-500/20 text-golden-500 text-sm rounded-full">
                        {book.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Sections */}
        <BookCarousel books={comics} title="Trending Comics" type="comic" />
        <BookCarousel books={manga} title="Popular Manga" type="manga" />
        <BookCarousel books={novels} title="Latest Novels" type="novel" />
      </div>
    </div>
  );
}