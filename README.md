# Freemium Content Platform

A comprehensive freemium content platform that combines a reading community with content creation tools. The platform operates on a "Freemium" model with two tiers: Standard (Free, Ad-Supported) and Pro (Paid Subscription).

## Features

### Standard Tier (Free, Ad-Supported)
- **Content Access**: Full access to all "Free-to-Read" content
- **Ad-Supported Model**: 
  - Content Open Ad: One ad shown when opening content
  - Per-Chapter Ad: One ad between chapters
  - Banner ads on non-reader pages
- **Community Access**: Full access to Writers Community (group chats and DMs)
- **Basic Features**: Rate content (1-5 stars) and add to personal "My List"
- **Creator Features**: Full access to Creator Studio for writing and publishing content

### Pro Tier (Paid Subscription)
- **Ad-Free Experience**: All ads removed
- **Offline Downloads**: Download content for offline reading
- **Premium Content Creation**: Option to create premium content with set prices
- **All Standard Features**: Everything from the Standard tier

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Stripe** for payment processing
- **Cloudinary** for image management

### Frontend
- **React** with React Router
- **React Query** for data fetching
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **React Hot Toast** for notifications

### Mobile Apps
- **React Native** with Expo
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **React Query** for data fetching

## Project Structure

```
freemium-content-platform/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── client/                # React web app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Screen components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── App.js             # Main app component
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freemium-content-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/freemium-platform
   JWT_SECRET=your-super-secret-jwt-key-here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development servers**
   ```bash
   # Start all services
   npm run dev

   # Or start individually
   npm run server    # Backend API (port 5000)
   npm run client    # React web app (port 3000)
   npm run mobile    # React Native mobile app
   ```

### Mobile App Setup

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Start the mobile app**
   ```bash
   cd mobile
   npm start
   ```

3. **Run on device/emulator**
   - Install Expo Go app on your device
   - Scan the QR code from the terminal
   - Or use iOS Simulator/Android Emulator

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Content
- `GET /api/content` - Get all content with filtering
- `GET /api/content/:id` - Get single content
- `GET /api/content/:id/chapters` - Get content chapters
- `GET /api/content/:id/chapters/:chapterNumber` - Get specific chapter
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/:id/rate` - Rate content
- `POST /api/content/:id/add-to-list` - Add to user's list

### User
- `GET /api/user/my-content` - Get user's content
- `GET /api/user/my-list` - Get user's saved list
- `GET /api/user/earnings` - Get user's earnings
- `GET /api/user/downloads` - Get user's downloads (Pro only)
- `POST /api/user/download/:contentId` - Download content (Pro only)

### Community
- `GET /api/community/channels` - Get all channels
- `POST /api/community/channels` - Create channel
- `GET /api/community/channels/:id` - Get channel
- `POST /api/community/channels/:id/join` - Join channel
- `POST /api/community/channels/:id/leave` - Leave channel
- `GET /api/community/channels/:id/messages` - Get channel messages
- `POST /api/community/channels/:id/messages` - Send channel message

### Payment
- `GET /api/payment/prices` - Get subscription prices
- `POST /api/payment/create-subscription` - Create subscription
- `POST /api/payment/cancel-subscription` - Cancel subscription
- `POST /api/payment/purchase-content` - Purchase premium content

### Ads
- `GET /api/ads/placement` - Get ad placement configuration
- `POST /api/ads/log-view` - Log ad view
- `GET /api/ads/stats` - Get ad statistics

## Database Models

### User
- Basic user information
- Subscription status (standard/pro)
- Ad share balance
- My list and purchased content

### Content
- Content metadata (title, description, cover image)
- Content type (novel, ebook, comic, manga)
- Monetization type (free_ad_share, premium_to_buy)
- Author information
- View counts and ratings

### Chapter
- Chapter content (text or gallery)
- Chapter metadata (title, number, read time)
- Publishing status

### Rating
- User ratings and reviews
- Content rating aggregation

### AdViewLog
- Ad view tracking
- Revenue calculation
- User and content association

### Chat Models
- Channels for group conversations
- Private conversations (DMs)
- Messages with attachments and reactions

## Key Features

### Content Reader
- Responsive reading interface
- Chapter navigation
- Ad integration for standard users
- Offline reading for Pro users

### Creator Studio
- Rich text editor for novels
- Gallery uploader for comics/manga
- Content management dashboard
- Earnings tracking

### Community Features
- Public and private channels
- Direct messaging
- Real-time chat with Socket.io

### Payment Integration
- Stripe subscription management
- Premium content purchases
- Revenue sharing for creators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@freemiumplatform.com or create an issue in the repository.