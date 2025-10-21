# Realtime System Documentation

## Overview

This document describes the comprehensive realtime system implemented across the application. The system converts all async operations to realtime processing using Socket.io, providing instant updates and notifications to connected clients.

## Architecture

### Backend Components

1. **Realtime Service** (`/services/api/src/services/realtimeService.js`)
   - Centralized service for emitting realtime events
   - Handles all types of realtime operations
   - Provides consistent API across all routes

2. **Socket.io Signaling** (`/services/api/src/realtime/signaling.js`)
   - Enhanced Socket.io server implementation
   - User authentication and room management
   - Real-time collaboration features

3. **Main Server Realtime** (`/server/services/realtimeService.js`)
   - Realtime service for the main server
   - Handles payment, ads, and community events

### Frontend Components

1. **Realtime Client** (`/services/api/src/services/realtimeClient.js`)
   - Client-side Socket.io wrapper
   - Event handling and room management
   - Automatic reconnection and error handling

2. **React Hook** (`/services/api/src/hooks/useRealtime.js`)
   - React hook for easy integration
   - Type-safe event handlers
   - Automatic cleanup and lifecycle management

## Supported Events

### Content Events
- `content-created` - New content created
- `content-updated` - Content metadata updated
- `content-deleted` - Content deleted
- `content-rated` - Content rated by user
- `content-viewed` - Content viewed by user

### Chapter Events
- `chapter-created` - New chapter created
- `chapter-updated` - Chapter content updated
- `chapter-deleted` - Chapter deleted

### User Events
- `user-profile-updated` - User profile updated
- `user-status-changed` - User online/offline status changed

### Relationship Events
- `friend-request-received` - Friend request received
- `friend-request-sent` - Friend request sent
- `friend-request-accepted` - Friend request accepted
- `friend-request-rejected` - Friend request rejected
- `friendship-ended` - Friendship ended

### Calendar Events
- `calendar-event-created` - New calendar event created
- `calendar-event-updated` - Calendar event updated
- `calendar-event-deleted` - Calendar event deleted
- `calendar-invite-received` - Calendar invite received
- `calendar-invite-accepted` - Calendar invite accepted
- `calendar-invite-rejected` - Calendar invite rejected

### Media Events
- `media-uploaded` - Media file uploaded
- `media-updated` - Media metadata updated
- `media-deleted` - Media file deleted

### Album Events
- `album-created` - New album created
- `album-updated` - Album updated
- `album-deleted` - Album deleted

### Diary Events
- `diary-entry-created` - New diary entry created
- `diary-entry-updated` - Diary entry updated
- `diary-entry-deleted` - Diary entry deleted

### Chat Events
- `message` - Generic message event
- `message-sent` - Message sent confirmation
- `message-received` - Message received notification

### Payment Events
- `payment-completed` - Payment completed
- `subscription-updated` - Subscription status updated

### Ad Events
- `ad-view-logged` - Ad view logged

### Notification Events
- `notification` - General notification
- `notification-read` - Notification marked as read
- `announcement` - System-wide announcement

### Collaboration Events
- `user-typing` - User typing indicator
- `user-editing` - User editing indicator

## Room Management

The system supports various room types for targeted realtime updates:

- `content_{contentId}` - Content-specific updates
- `calendar_{calendarId}` - Calendar event updates
- `media_{mediaId}` - Media-specific updates
- `album_{albumId}` - Album-specific updates
- `diary_{diaryId}` - Diary entry updates
- `user_{userId}` - User-specific updates

## Usage Examples

### Backend Route Integration

```javascript
import realtimeService from '../services/realtimeService.js';

// In your route handler
router.post('/content', auth, async (req, res) => {
  try {
    const content = await Content.create(req.body);
    
    // Emit realtime event
    realtimeService.emitContentCreated(content);
    
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### Frontend React Integration

```javascript
import useRealtime from '../hooks/useRealtime';

const MyComponent = ({ token, serverUrl }) => {
  const {
    connectionStatus,
    onContentCreated,
    onContentUpdated,
    joinContentRoom,
    sendMessage
  } = useRealtime(token, serverUrl);

  useEffect(() => {
    const unsubscribe = onContentCreated((data) => {
      console.log('New content:', data);
      // Update UI
    });

    return unsubscribe;
  }, [onContentCreated]);

  const handleJoinRoom = (contentId) => {
    joinContentRoom(contentId);
  };

  return (
    <div>
      <p>Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={() => handleJoinRoom('content123')}>
        Join Content Room
      </button>
    </div>
  );
};
```

### Direct Client Usage

```javascript
import realtimeClient from '../services/realtimeClient';

// Initialize connection
realtimeClient.connect('ws://localhost:3001', 'your-jwt-token');

// Listen for events
realtimeClient.on('content-created', (data) => {
  console.log('New content:', data);
});

// Join rooms
realtimeClient.joinContentRoom('content123');

// Send messages
realtimeClient.sendMessage('user123', 'Hello!');

// Cleanup
realtimeClient.disconnect();
```

## Configuration

### Environment Variables

```env
# Socket.io configuration
SOCKET_PORT=3001
SOCKET_CORS_ORIGIN=http://localhost:3000

# JWT configuration
JWT_SECRET=your-secret-key
```

### Server Setup

```javascript
// services/api/index.js
import realtimeService from './src/services/realtimeService.js';

const realtimeHelpers = signaling(io);
realtimeService.initialize(io, realtimeHelpers);
global.realtimeService = realtimeService;
```

## Error Handling

The system includes comprehensive error handling:

1. **Connection Errors** - Automatic reconnection with exponential backoff
2. **Authentication Errors** - Token validation and reconnection
3. **Event Handler Errors** - Isolated error handling per event
4. **Room Management Errors** - Graceful fallback for room operations

## Performance Considerations

1. **Event Debouncing** - Prevents spam of similar events
2. **Room Management** - Efficient room joining/leaving
3. **Memory Management** - Automatic cleanup of event handlers
4. **Connection Pooling** - Efficient Socket.io connection management

## Security

1. **JWT Authentication** - All connections require valid JWT tokens
2. **Room Authorization** - Users can only join authorized rooms
3. **Event Validation** - All events are validated before processing
4. **Rate Limiting** - Prevents abuse of realtime features

## Testing

The system includes comprehensive testing:

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - End-to-end realtime flow testing
3. **Load Tests** - Performance under high connection counts
4. **Error Tests** - Error scenario testing

## Monitoring

1. **Connection Metrics** - Track active connections
2. **Event Metrics** - Monitor event frequency and types
3. **Error Metrics** - Track and alert on errors
4. **Performance Metrics** - Monitor response times and throughput

## Migration Guide

To migrate existing async operations to realtime:

1. **Identify Async Operations** - Find all async/await patterns
2. **Add Realtime Events** - Emit events after successful operations
3. **Update Frontend** - Listen for realtime events
4. **Test Integration** - Ensure realtime updates work correctly
5. **Monitor Performance** - Watch for any performance impacts

## Troubleshooting

### Common Issues

1. **Connection Drops** - Check network stability and token validity
2. **Missing Events** - Verify event names and room membership
3. **Performance Issues** - Monitor connection count and event frequency
4. **Authentication Errors** - Check JWT token validity and expiration

### Debug Mode

Enable debug logging:

```javascript
// Client side
localStorage.setItem('realtime-debug', 'true');

// Server side
process.env.REALTIME_DEBUG = 'true';
```

## Future Enhancements

1. **Message Queuing** - Persistent message delivery
2. **Event Persistence** - Store events for offline users
3. **Advanced Collaboration** - Real-time document editing
4. **Mobile Push Notifications** - Background notifications
5. **Analytics Integration** - Detailed usage analytics

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the error logs
3. Test with debug mode enabled
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial realtime system implementation
- Support for all major event types
- React hook integration
- Comprehensive documentation