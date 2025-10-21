// Realtime service for emitting events across the application
class RealtimeService {
  constructor() {
    this.io = null;
    this.helpers = null;
  }

  initialize(io, helpers) {
    this.io = io;
    this.helpers = helpers;
  }

  // Content-related realtime events
  emitContentCreated(content) {
    this.helpers?.broadcastToAll('content-created', {
      content,
      timestamp: new Date()
    });
  }

  emitContentUpdated(content) {
    this.helpers?.broadcastToAll('content-updated', {
      content,
      timestamp: new Date()
    });
    
    // Also emit to content-specific room
    this.helpers?.emitToRoom(`content_${content._id}`, 'content-updated', {
      content,
      timestamp: new Date()
    });
  }

  emitContentDeleted(contentId) {
    this.helpers?.broadcastToAll('content-deleted', {
      contentId,
      timestamp: new Date()
    });
  }

  emitContentRated(contentId, rating) {
    this.helpers?.emitToRoom(`content_${contentId}`, 'content-rated', {
      contentId,
      rating,
      timestamp: new Date()
    });
  }

  emitContentViewed(contentId, userId) {
    this.helpers?.emitToRoom(`content_${contentId}`, 'content-viewed', {
      contentId,
      userId,
      timestamp: new Date()
    });
  }

  // Chapter-related realtime events
  emitChapterCreated(chapter) {
    this.helpers?.emitToRoom(`content_${chapter.contentId}`, 'chapter-created', {
      chapter,
      timestamp: new Date()
    });
  }

  emitChapterUpdated(chapter) {
    this.helpers?.emitToRoom(`content_${chapter.contentId}`, 'chapter-updated', {
      chapter,
      timestamp: new Date()
    });
  }

  emitChapterDeleted(chapterId, contentId) {
    this.helpers?.emitToRoom(`content_${contentId}`, 'chapter-deleted', {
      chapterId,
      contentId,
      timestamp: new Date()
    });
  }

  // User-related realtime events
  emitUserUpdated(user) {
    this.helpers?.emitToUser(user._id, 'user-profile-updated', {
      user,
      timestamp: new Date()
    });
  }

  emitUserStatusChanged(userId, status) {
    this.helpers?.broadcastToAll('user-status-changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Relationship-related realtime events
  emitFriendRequestSent(senderId, recipientId, request) {
    this.helpers?.emitToUser(recipientId, 'friend-request-received', {
      request,
      senderId,
      timestamp: new Date()
    });
    this.helpers?.emitToUser(senderId, 'friend-request-sent', {
      request,
      recipientId,
      timestamp: new Date()
    });
  }

  emitFriendRequestAccepted(senderId, recipientId) {
    this.helpers?.emitToUser(senderId, 'friend-request-accepted', {
      recipientId,
      timestamp: new Date()
    });
    this.helpers?.emitToUser(recipientId, 'friend-request-accepted', {
      senderId,
      timestamp: new Date()
    });
  }

  emitFriendRequestRejected(senderId, recipientId) {
    this.helpers?.emitToUser(senderId, 'friend-request-rejected', {
      recipientId,
      timestamp: new Date()
    });
  }

  emitFriendshipEnded(userId1, userId2) {
    this.helpers?.emitToUser(userId1, 'friendship-ended', {
      friendId: userId2,
      timestamp: new Date()
    });
    this.helpers?.emitToUser(userId2, 'friendship-ended', {
      friendId: userId1,
      timestamp: new Date()
    });
  }

  // Calendar-related realtime events
  emitCalendarEventCreated(event) {
    this.helpers?.broadcastToAll('calendar-event-created', {
      event,
      timestamp: new Date()
    });
  }

  emitCalendarEventUpdated(event) {
    this.helpers?.broadcastToAll('calendar-event-updated', {
      event,
      timestamp: new Date()
    });
    
    // Also emit to event-specific room
    this.helpers?.emitToRoom(`calendar_${event._id}`, 'calendar-event-updated', {
      event,
      timestamp: new Date()
    });
  }

  emitCalendarEventDeleted(eventId) {
    this.helpers?.broadcastToAll('calendar-event-deleted', {
      eventId,
      timestamp: new Date()
    });
  }

  emitCalendarInviteSent(eventId, recipientId) {
    this.helpers?.emitToUser(recipientId, 'calendar-invite-received', {
      eventId,
      timestamp: new Date()
    });
  }

  emitCalendarInviteAccepted(eventId, userId) {
    this.helpers?.emitToRoom(`calendar_${eventId}`, 'calendar-invite-accepted', {
      eventId,
      userId,
      timestamp: new Date()
    });
  }

  emitCalendarInviteRejected(eventId, userId) {
    this.helpers?.emitToRoom(`calendar_${eventId}`, 'calendar-invite-rejected', {
      eventId,
      userId,
      timestamp: new Date()
    });
  }

  // Media-related realtime events
  emitMediaUploaded(media) {
    this.helpers?.emitToUser(media.uploadedBy, 'media-uploaded', {
      media,
      timestamp: new Date()
    });
  }

  emitMediaUpdated(media) {
    this.helpers?.emitToUser(media.uploadedBy, 'media-updated', {
      media,
      timestamp: new Date()
    });
    
    // Also emit to media-specific room
    this.helpers?.emitToRoom(`media_${media._id}`, 'media-updated', {
      media,
      timestamp: new Date()
    });
  }

  emitMediaDeleted(mediaId, uploadedBy) {
    this.helpers?.emitToUser(uploadedBy, 'media-deleted', {
      mediaId,
      timestamp: new Date()
    });
  }

  // Album-related realtime events
  emitAlbumCreated(album) {
    this.helpers?.emitToUser(album.createdBy, 'album-created', {
      album,
      timestamp: new Date()
    });
  }

  emitAlbumUpdated(album) {
    this.helpers?.emitToUser(album.createdBy, 'album-updated', {
      album,
      timestamp: new Date()
    });
    
    // Also emit to album-specific room
    this.helpers?.emitToRoom(`album_${album._id}`, 'album-updated', {
      album,
      timestamp: new Date()
    });
  }

  emitAlbumDeleted(albumId, createdBy) {
    this.helpers?.emitToUser(createdBy, 'album-deleted', {
      albumId,
      timestamp: new Date()
    });
  }

  // Diary-related realtime events
  emitDiaryEntryCreated(entry) {
    this.helpers?.emitToUser(entry.authorId, 'diary-entry-created', {
      entry,
      timestamp: new Date()
    });
  }

  emitDiaryEntryUpdated(entry) {
    this.helpers?.emitToUser(entry.authorId, 'diary-entry-updated', {
      entry,
      timestamp: new Date()
    });
    
    // Also emit to diary-specific room
    this.helpers?.emitToRoom(`diary_${entry._id}`, 'diary-entry-updated', {
      entry,
      timestamp: new Date()
    });
  }

  emitDiaryEntryDeleted(entryId, authorId) {
    this.helpers?.emitToUser(authorId, 'diary-entry-deleted', {
      entryId,
      timestamp: new Date()
    });
  }

  // Chat-related realtime events
  emitMessageSent(message) {
    this.helpers?.emitToUser(message.sender, 'message-sent', {
      message,
      timestamp: new Date()
    });
    this.helpers?.emitToUser(message.recipient, 'message-received', {
      message,
      timestamp: new Date()
    });
  }

  // Payment-related realtime events
  emitPaymentCompleted(userId, paymentData) {
    this.helpers?.emitToUser(userId, 'payment-completed', {
      paymentData,
      timestamp: new Date()
    });
  }

  emitSubscriptionUpdated(userId, subscriptionData) {
    this.helpers?.emitToUser(userId, 'subscription-updated', {
      subscriptionData,
      timestamp: new Date()
    });
  }

  // Ad-related realtime events
  emitAdViewLogged(userId, adData) {
    this.helpers?.emitToUser(userId, 'ad-view-logged', {
      adData,
      timestamp: new Date()
    });
  }

  // Generic notification system
  emitNotification(userId, notification) {
    this.helpers?.emitToUser(userId, 'notification', {
      notification,
      timestamp: new Date()
    });
  }

  // System-wide announcements
  emitAnnouncement(announcement) {
    this.helpers?.broadcastToAll('announcement', {
      announcement,
      timestamp: new Date()
    });
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;