import mongoose from 'mongoose';
import Content from '../models/Content';
import Channel from '../models/Channel';
import dotenv from 'dotenv';

dotenv.config();

const sampleBooks = [
  // Novels
  {
    title: "The Golden Compass",
    author: "Philip Pullman",
    coverImageURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "A fantasy novel about a young girl's journey through parallel worlds.",
    type: "novel" as const,
    tags: ["Fantasy", "Adventure", "Young Adult"]
  },
  {
    title: "1984",
    author: "George Orwell",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A dystopian social science fiction novel about totalitarian control.",
    type: "novel" as const,
    tags: ["Dystopian", "Science Fiction", "Classic"]
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A romantic novel about the relationship between Elizabeth Bennet and Mr. Darcy.",
    type: "novel" as const,
    tags: ["Romance", "Classic", "Historical"]
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImageURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.",
    type: "novel" as const,
    tags: ["Classic", "American Literature", "Drama"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A novel about racial injustice and childhood innocence in the American South.",
    type: "novel" as const,
    tags: ["Classic", "Drama", "Social Issues"]
  },

  // E-Books
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A methodology for developing businesses and products through validated learning.",
    type: "ebook" as const,
    tags: ["Business", "Entrepreneurship", "Startup"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    coverImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A guide to building good habits and breaking bad ones.",
    type: "ebook" as const,
    tags: ["Self-Help", "Productivity", "Psychology"]
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImageURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    description: "A brief history of humankind from the Stone Age to the present.",
    type: "ebook" as const,
    tags: ["History", "Anthropology", "Philosophy"]
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "An exploration of the two systems that drive the way we think.",
    type: "ebook" as const,
    tags: ["Psychology", "Cognitive Science", "Decision Making"]
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    coverImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A guide to spiritual enlightenment through present-moment awareness.",
    type: "ebook" as const,
    tags: ["Spirituality", "Mindfulness", "Self-Help"]
  },

  // Comics
  {
    title: "Watchmen",
    author: "Alan Moore",
    coverImageURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "A graphic novel about superheroes in an alternate history.",
    type: "comic" as const,
    tags: ["Superhero", "Dystopian", "Graphic Novel"]
  },
  {
    title: "The Dark Knight Returns",
    author: "Frank Miller",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A Batman story set in a dystopian future.",
    type: "comic" as const,
    tags: ["Superhero", "Batman", "Dystopian"]
  },
  {
    title: "Saga",
    author: "Brian K. Vaughan",
    coverImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A space opera/fantasy comic book series.",
    type: "comic" as const,
    tags: ["Science Fiction", "Fantasy", "Space Opera"]
  },
  {
    title: "Maus",
    author: "Art Spiegelman",
    coverImageURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    description: "A graphic novel about the Holocaust using anthropomorphic animals.",
    type: "comic" as const,
    tags: ["Historical", "Drama", "Holocaust"]
  },
  {
    title: "Sandman",
    author: "Neil Gaiman",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A fantasy comic book series about Dream of the Endless.",
    type: "comic" as const,
    tags: ["Fantasy", "Horror", "Mythology"]
  },

  // Manga
  {
    title: "Attack on Titan",
    author: "Hajime Isayama",
    coverImageURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "A dark fantasy manga about humanity's fight against giant humanoid Titans.",
    type: "manga" as const,
    tags: ["Action", "Drama", "Dark Fantasy"]
  },
  {
    title: "One Piece",
    author: "Eiichiro Oda",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A pirate adventure manga following Monkey D. Luffy and his crew.",
    type: "manga" as const,
    tags: ["Adventure", "Comedy", "Pirates"]
  },
  {
    title: "Naruto",
    author: "Masashi Kishimoto",
    coverImageURL: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A ninja manga following Naruto Uzumaki's journey to become Hokage.",
    type: "manga" as const,
    tags: ["Action", "Adventure", "Ninja"]
  },
  {
    title: "Death Note",
    author: "Tsugumi Ohba",
    coverImageURL: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
    description: "A psychological thriller about a high school student who finds a supernatural notebook.",
    type: "manga" as const,
    tags: ["Psychological", "Thriller", "Supernatural"]
  },
  {
    title: "Dragon Ball",
    author: "Akira Toriyama",
    coverImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A martial arts manga following Goku's adventures and battles.",
    type: "manga" as const,
    tags: ["Action", "Adventure", "Martial Arts"]
  }
];

const sampleChannels = [
  {
    name: "general",
    description: "General discussion about books and reading"
  },
  {
    name: "fantasy",
    description: "Fantasy novels, comics, and manga discussion"
  },
  {
    name: "sci-fi",
    description: "Science fiction and futuristic stories"
  },
  {
    name: "classics",
    description: "Classic literature and timeless works"
  },
  {
    name: "manga-anime",
    description: "Manga and anime discussions"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/golden-library');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Content.deleteMany({});
    await Channel.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample books
    await Content.insertMany(sampleBooks);
    console.log(`Inserted ${sampleBooks.length} books`);

    // Insert sample channels
    await Channel.insertMany(sampleChannels);
    console.log(`Inserted ${sampleChannels.length} channels`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();