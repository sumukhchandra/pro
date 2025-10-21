// Realtime client service for frontend applications
class RealtimeClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize connection
  connect(serverUrl, token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to realtime server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from realtime server:', reason);
      this.isConnected = false;
      this.emit('connection-status', { connected: false, reason });
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.socket.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection-error', error);
    });

    // Content events
    this.socket.on('content-created', (data) => {
      this.emit('content-created', data);
    });

    this.socket.on('content-updated', (data) => {
      this.emit('content-updated', data);
    });

    this.socket.on('content-deleted', (data) => {
      this.emit('content-deleted', data);
    });

    this.socket.on('content-rated', (data) => {
      this.emit('content-rated', data);
    });

    this.socket.on('content-viewed', (data) => {
      this.emit('content-viewed', data);
    });

    // Chapter events
    this.socket.on('chapter-created', (data) => {
      this.emit('chapter-created', data);
    });

    this.socket.on('chapter-updated', (data) => {
      this.emit('chapter-updated', data);
    });

    this.socket.on('chapter-deleted', (data) => {
      this.emit('chapter-deleted', data);
    });

    // User events
    this.socket.on('user-profile-updated', (data) => {
      this.emit('user-profile-updated', data);
    });

    this.socket.on('user-status-changed', (data) => {
      this.emit('user-status-changed', data);
    });

    // Relationship events
    this.socket.on('friend-request-received', (data) => {
      this.emit('friend-request-received', data);
    });

    this.socket.on('friend-request-sent', (data) => {
      this.emit('friend-request-sent', data);
    });

    this.socket.on('friend-request-accepted', (data) => {
      this.emit('friend-request-accepted', data);
    });

    this.socket.on('friend-request-rejected', (data) => {
      this.emit('friend-request-rejected', data);
    });

    this.socket.on('friendship-ended', (data) => {
      this.emit('friendship-ended', data);
    });

    // Calendar events
    this.socket.on('calendar-event-created', (data) => {
      this.emit('calendar-event-created', data);
    });

    this.socket.on('calendar-event-updated', (data) => {
      this.emit('calendar-event-updated', data);
    });

    this.socket.on('calendar-event-deleted', (data) => {
      this.emit('calendar-event-deleted', data);
    });

    this.socket.on('calendar-invite-received', (data) => {
      this.emit('calendar-invite-received', data);
    });

    this.socket.on('calendar-invite-accepted', (data) => {
      this.emit('calendar-invite-accepted', data);
    });

    this.socket.on('calendar-invite-rejected', (data) => {
      this.emit('calendar-invite-rejected', data);
    });

    // Media events
    this.socket.on('media-uploaded', (data) => {
      this.emit('media-uploaded', data);
    });

    this.socket.on('media-updated', (data) => {
      this.emit('media-updated', data);
    });

    this.socket.on('media-deleted', (data) => {
      this.emit('media-deleted', data);
    });

    // Album events
    this.socket.on('album-created', (data) => {
      this.emit('album-created', data);
    });

    this.socket.on('album-updated', (data) => {
      this.emit('album-updated', data);
    });

    this.socket.on('album-deleted', (data) => {
      this.emit('album-deleted', data);
    });

    // Diary events
    this.socket.on('diary-entry-created', (data) => {
      this.emit('diary-entry-created', data);
    });

    this.socket.on('diary-entry-updated', (data) => {
      this.emit('diary-entry-updated', data);
    });

    this.socket.on('diary-entry-deleted', (data) => {
      this.emit('diary-entry-deleted', data);
    });

    // Chat events
    this.socket.on('message', (data) => {
      this.emit('message', data);
    });

    this.socket.on('message-sent', (data) => {
      this.emit('message-sent', data);
    });

    this.socket.on('message-received', (data) => {
      this.emit('message-received', data);
    });

    // Payment events
    this.socket.on('payment-completed', (data) => {
      this.emit('payment-completed', data);
    });

    this.socket.on('subscription-updated', (data) => {
      this.emit('subscription-updated', data);
    });

    // Ad events
    this.socket.on('ad-view-logged', (data) => {
      this.emit('ad-view-logged', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('notification-read', (data) => {
      this.emit('notification-read', data);
    });

    // Announcement events
    this.socket.on('announcement', (data) => {
      this.emit('announcement', data);
    });

    // Typing indicators
    this.socket.on('user-typing', (data) => {
      this.emit('user-typing', data);
    });

    // Collaboration events
    this.socket.on('user-editing', (data) => {
      this.emit('user-editing', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  // Join rooms
  joinContentRoom(contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-content-room', contentId);
    }
  }

  leaveContentRoom(contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-content-room', contentId);
    }
  }

  joinCalendarRoom(calendarId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-calendar-room', calendarId);
    }
  }

  leaveCalendarRoom(calendarId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-calendar-room', calendarId);
    }
  }

  joinMediaRoom(mediaId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-media-room', mediaId);
    }
  }

  joinAlbumRoom(albumId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-album-room', albumId);
    }
  }

  joinDiaryRoom(diaryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-diary-room', diaryId);
    }
  }

  // Send messages
  sendMessage(recipientId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', { recipientId, content });
    }
  }

  // Typing indicators
  startTyping(recipientId, contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', { recipientId, contentId });
    }
  }

  stopTyping(recipientId, contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', { recipientId, contentId });
    }
  }

  // Collaboration
  startContentEdit(contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('content-edit-start', contentId);
    }
  }

  stopContentEdit(contentId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('content-edit-stop', contentId);
    }
  }

  // Status updates
  updateStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-status', status);
    }
  }

  // Notifications
  markNotificationRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark-notification-read', notificationId);
    }
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: this.socket ? this.socket.id : null
    };
  }
}

// Create singleton instance
const realtimeClient = new RealtimeClient();

export default realtimeClient;