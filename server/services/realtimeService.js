// Realtime service for emitting events across the main server application
class RealtimeService {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;
  }

  // Content-related realtime events
  emitContentCreated(content) {
    this.io?.emit('content-created', {
      content,
      timestamp: new Date()
    });
  }

  emitContentUpdated(content) {
    this.io?.emit('content-updated', {
      content,
      timestamp: new Date()
    });
  }

  emitContentDeleted(contentId) {
    this.io?.emit('content-deleted', {
      contentId,
      timestamp: new Date()
    });
  }

  emitContentRated(contentId, rating) {
    this.io?.emit('content-rated', {
      contentId,
      rating,
      timestamp: new Date()
    });
  }

  emitContentViewed(contentId, userId) {
    this.io?.emit('content-viewed', {
      contentId,
      userId,
      timestamp: new Date()
    });
  }

  // User-related realtime events
  emitUserUpdated(user) {
    this.io?.emit('user-profile-updated', {
      user,
      timestamp: new Date()
    });
  }

  emitUserStatusChanged(userId, status) {
    this.io?.emit('user-status-changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Payment-related realtime events
  emitPaymentCompleted(userId, paymentData) {
    this.io?.emit('payment-completed', {
      paymentData,
      userId,
      timestamp: new Date()
    });
  }

  emitSubscriptionUpdated(userId, subscriptionData) {
    this.io?.emit('subscription-updated', {
      subscriptionData,
      userId,
      timestamp: new Date()
    });
  }

  // Ad-related realtime events
  emitAdViewLogged(userId, adData) {
    this.io?.emit('ad-view-logged', {
      adData,
      userId,
      timestamp: new Date()
    });
  }

  // Community-related realtime events
  emitChannelCreated(channel) {
    this.io?.emit('channel-created', {
      channel,
      timestamp: new Date()
    });
  }

  emitChannelUpdated(channel) {
    this.io?.emit('channel-updated', {
      channel,
      timestamp: new Date()
    });
  }

  emitChannelDeleted(channelId) {
    this.io?.emit('channel-deleted', {
      channelId,
      timestamp: new Date()
    });
  }

  emitMessageSent(message) {
    this.io?.emit('message-sent', {
      message,
      timestamp: new Date()
    });
  }

  // Generic notification system
  emitNotification(userId, notification) {
    this.io?.emit('notification', {
      notification,
      userId,
      timestamp: new Date()
    });
  }

  // System-wide announcements
  emitAnnouncement(announcement) {
    this.io?.emit('announcement', {
      announcement,
      timestamp: new Date()
    });
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

module.exports = realtimeService;