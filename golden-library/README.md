# The Golden Library - Digital Book Hub

A premium digital book platform featuring a sleek black and gold theme, built with Next.js, React Native, and Node.js.

## 🎨 Design Theme

- **Primary Colors**: Deep black (#111111) backgrounds with vibrant gold (#FFD700) accents
- **Typography**: Elegant serif fonts for headings, clean sans-serif for body text
- **UI Elements**: All interactive elements use gold highlighting and smooth transitions

## 🏗️ Architecture

### Frontend (Web)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom black/gold theme
- **State Management**: React hooks and context
- **Authentication**: JWT-based with localStorage

### Mobile App
- **Framework**: React Native with TypeScript
- **Navigation**: Bottom tab navigation
- **Storage**: AsyncStorage for authentication
- **UI**: Custom components matching web theme

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for chat functionality
- **API**: RESTful endpoints with proper error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- React Native development environment (for mobile)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

5. **Seed the database** (optional):
   ```bash
   npx ts-node src/scripts/seedData.ts
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

### Mobile App Setup

1. **Navigate to mobile directory**:
   ```bash
   cd mobile/GoldenLibraryMobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Metro bundler**:
   ```bash
   npx react-native start
   ```

4. **Run on Android**:
   ```bash
   npx react-native run-android
   ```

5. **Run on iOS**:
   ```bash
   npx react-native run-ios
   ```

## 📱 Features

### Authentication
- User registration and login
- JWT-based session management
- Secure password hashing

### Book Management
- Browse books by category (Novels, E-Books, Comics, Manga)
- Save books to personal reading list
- Search and filter functionality
- Most liked books sections

### Community Features
- Real-time chat channels
- Direct messaging between users
- User search and discovery

### Responsive Design
- Mobile-first approach
- Consistent black and gold theme
- Smooth animations and transitions

## 🗄️ Database Schema

### User Model
- email, passwordHash, username
- savedList (array of content references)

### Content Model
- title, author, coverImageURL, description
- type (novel, ebook, comic, manga)
- tags (array of strings)

### Chat Models
- Channel: name, description, members
- Message: content, sender, timestamp
- DirectMessage: participants (2 users)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content
- `GET /api/content` - Get all content with filtering
- `GET /api/content/most-liked` - Get most liked content
- `POST /api/content/:id/like` - Like content
- `DELETE /api/content/:id/like` - Unlike content

### User
- `GET /api/user/saved` - Get saved books
- `POST /api/user/saved/:id` - Save book
- `DELETE /api/user/saved/:id` - Remove saved book

### Chat
- `GET /api/chat/channels` - Get all channels
- `GET /api/chat/channels/:id/messages` - Get channel messages
- `GET /api/chat/search-users` - Search users

## 🎯 Future Enhancements

- Individual book detail pages
- User profiles and settings
- Global search functionality
- Rating and review system
- Reading progress tracking
- Book recommendations
- Push notifications
- Offline reading support

## 🛠️ Development

### Project Structure
```
golden-library/
├── frontend/          # Next.js web application
├── mobile/            # React Native mobile app
├── backend/           # Node.js API server
└── README.md
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Consistent naming conventions

## 📄 License

This project is created for demonstration purposes. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**The Golden Library** - Where every page is a golden opportunity to discover something new.