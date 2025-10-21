import { useEffect, useRef, useCallback } from 'react';
import realtimeClient from '../services/realtimeClient';

// Custom hook for using realtime functionality
export const useRealtime = (token, serverUrl) => {
  const isInitialized = useRef(false);

  // Initialize connection
  useEffect(() => {
    if (token && serverUrl && !isInitialized.current) {
      realtimeClient.connect(serverUrl, token);
      isInitialized.current = true;
    }

    return () => {
      if (isInitialized.current) {
        realtimeClient.disconnect();
        isInitialized.current = false;
      }
    };
  }, [token, serverUrl]);

  // Connection status
  const connectionStatus = realtimeClient.getConnectionStatus();

  // Event handlers
  const onContentCreated = useCallback((handler) => {
    realtimeClient.on('content-created', handler);
    return () => realtimeClient.off('content-created', handler);
  }, []);

  const onContentUpdated = useCallback((handler) => {
    realtimeClient.on('content-updated', handler);
    return () => realtimeClient.off('content-updated', handler);
  }, []);

  const onContentDeleted = useCallback((handler) => {
    realtimeClient.on('content-deleted', handler);
    return () => realtimeClient.off('content-deleted', handler);
  }, []);

  const onContentRated = useCallback((handler) => {
    realtimeClient.on('content-rated', handler);
    return () => realtimeClient.off('content-rated', handler);
  }, []);

  const onContentViewed = useCallback((handler) => {
    realtimeClient.on('content-viewed', handler);
    return () => realtimeClient.off('content-viewed', handler);
  }, []);

  const onChapterCreated = useCallback((handler) => {
    realtimeClient.on('chapter-created', handler);
    return () => realtimeClient.off('chapter-created', handler);
  }, []);

  const onChapterUpdated = useCallback((handler) => {
    realtimeClient.on('chapter-updated', handler);
    return () => realtimeClient.off('chapter-updated', handler);
  }, []);

  const onChapterDeleted = useCallback((handler) => {
    realtimeClient.on('chapter-deleted', handler);
    return () => realtimeClient.off('chapter-deleted', handler);
  }, []);

  const onUserProfileUpdated = useCallback((handler) => {
    realtimeClient.on('user-profile-updated', handler);
    return () => realtimeClient.off('user-profile-updated', handler);
  }, []);

  const onUserStatusChanged = useCallback((handler) => {
    realtimeClient.on('user-status-changed', handler);
    return () => realtimeClient.off('user-status-changed', handler);
  }, []);

  const onFriendRequestReceived = useCallback((handler) => {
    realtimeClient.on('friend-request-received', handler);
    return () => realtimeClient.off('friend-request-received', handler);
  }, []);

  const onFriendRequestAccepted = useCallback((handler) => {
    realtimeClient.on('friend-request-accepted', handler);
    return () => realtimeClient.off('friend-request-accepted', handler);
  }, []);

  const onFriendRequestRejected = useCallback((handler) => {
    realtimeClient.on('friend-request-rejected', handler);
    return () => realtimeClient.off('friend-request-rejected', handler);
  }, []);

  const onFriendshipEnded = useCallback((handler) => {
    realtimeClient.on('friendship-ended', handler);
    return () => realtimeClient.off('friendship-ended', handler);
  }, []);

  const onCalendarEventCreated = useCallback((handler) => {
    realtimeClient.on('calendar-event-created', handler);
    return () => realtimeClient.off('calendar-event-created', handler);
  }, []);

  const onCalendarEventUpdated = useCallback((handler) => {
    realtimeClient.on('calendar-event-updated', handler);
    return () => realtimeClient.off('calendar-event-updated', handler);
  }, []);

  const onCalendarEventDeleted = useCallback((handler) => {
    realtimeClient.on('calendar-event-deleted', handler);
    return () => realtimeClient.off('calendar-event-deleted', handler);
  }, []);

  const onCalendarInviteReceived = useCallback((handler) => {
    realtimeClient.on('calendar-invite-received', handler);
    return () => realtimeClient.off('calendar-invite-received', handler);
  }, []);

  const onMediaUploaded = useCallback((handler) => {
    realtimeClient.on('media-uploaded', handler);
    return () => realtimeClient.off('media-uploaded', handler);
  }, []);

  const onMediaUpdated = useCallback((handler) => {
    realtimeClient.on('media-updated', handler);
    return () => realtimeClient.off('media-updated', handler);
  }, []);

  const onMediaDeleted = useCallback((handler) => {
    realtimeClient.on('media-deleted', handler);
    return () => realtimeClient.off('media-deleted', handler);
  }, []);

  const onAlbumCreated = useCallback((handler) => {
    realtimeClient.on('album-created', handler);
    return () => realtimeClient.off('album-created', handler);
  }, []);

  const onAlbumUpdated = useCallback((handler) => {
    realtimeClient.on('album-updated', handler);
    return () => realtimeClient.off('album-updated', handler);
  }, []);

  const onAlbumDeleted = useCallback((handler) => {
    realtimeClient.on('album-deleted', handler);
    return () => realtimeClient.off('album-deleted', handler);
  }, []);

  const onDiaryEntryCreated = useCallback((handler) => {
    realtimeClient.on('diary-entry-created', handler);
    return () => realtimeClient.off('diary-entry-created', handler);
  }, []);

  const onDiaryEntryUpdated = useCallback((handler) => {
    realtimeClient.on('diary-entry-updated', handler);
    return () => realtimeClient.off('diary-entry-updated', handler);
  }, []);

  const onDiaryEntryDeleted = useCallback((handler) => {
    realtimeClient.on('diary-entry-deleted', handler);
    return () => realtimeClient.off('diary-entry-deleted', handler);
  }, []);

  const onMessage = useCallback((handler) => {
    realtimeClient.on('message', handler);
    return () => realtimeClient.off('message', handler);
  }, []);

  const onMessageSent = useCallback((handler) => {
    realtimeClient.on('message-sent', handler);
    return () => realtimeClient.off('message-sent', handler);
  }, []);

  const onMessageReceived = useCallback((handler) => {
    realtimeClient.on('message-received', handler);
    return () => realtimeClient.off('message-received', handler);
  }, []);

  const onPaymentCompleted = useCallback((handler) => {
    realtimeClient.on('payment-completed', handler);
    return () => realtimeClient.off('payment-completed', handler);
  }, []);

  const onSubscriptionUpdated = useCallback((handler) => {
    realtimeClient.on('subscription-updated', handler);
    return () => realtimeClient.off('subscription-updated', handler);
  }, []);

  const onAdViewLogged = useCallback((handler) => {
    realtimeClient.on('ad-view-logged', handler);
    return () => realtimeClient.off('ad-view-logged', handler);
  }, []);

  const onNotification = useCallback((handler) => {
    realtimeClient.on('notification', handler);
    return () => realtimeClient.off('notification', handler);
  }, []);

  const onNotificationRead = useCallback((handler) => {
    realtimeClient.on('notification-read', handler);
    return () => realtimeClient.off('notification-read', handler);
  }, []);

  const onAnnouncement = useCallback((handler) => {
    realtimeClient.on('announcement', handler);
    return () => realtimeClient.off('announcement', handler);
  }, []);

  const onUserTyping = useCallback((handler) => {
    realtimeClient.on('user-typing', handler);
    return () => realtimeClient.off('user-typing', handler);
  }, []);

  const onUserEditing = useCallback((handler) => {
    realtimeClient.on('user-editing', handler);
    return () => realtimeClient.off('user-editing', handler);
  }, []);

  const onConnectionStatus = useCallback((handler) => {
    realtimeClient.on('connection-status', handler);
    return () => realtimeClient.off('connection-status', handler);
  }, []);

  const onError = useCallback((handler) => {
    realtimeClient.on('error', handler);
    return () => realtimeClient.off('error', handler);
  }, []);

  // Room management
  const joinContentRoom = useCallback((contentId) => {
    realtimeClient.joinContentRoom(contentId);
  }, []);

  const leaveContentRoom = useCallback((contentId) => {
    realtimeClient.leaveContentRoom(contentId);
  }, []);

  const joinCalendarRoom = useCallback((calendarId) => {
    realtimeClient.joinCalendarRoom(calendarId);
  }, []);

  const leaveCalendarRoom = useCallback((calendarId) => {
    realtimeClient.leaveCalendarRoom(calendarId);
  }, []);

  const joinMediaRoom = useCallback((mediaId) => {
    realtimeClient.joinMediaRoom(mediaId);
  }, []);

  const joinAlbumRoom = useCallback((albumId) => {
    realtimeClient.joinAlbumRoom(albumId);
  }, []);

  const joinDiaryRoom = useCallback((diaryId) => {
    realtimeClient.joinDiaryRoom(diaryId);
  }, []);

  // Actions
  const sendMessage = useCallback((recipientId, content) => {
    realtimeClient.sendMessage(recipientId, content);
  }, []);

  const startTyping = useCallback((recipientId, contentId) => {
    realtimeClient.startTyping(recipientId, contentId);
  }, []);

  const stopTyping = useCallback((recipientId, contentId) => {
    realtimeClient.stopTyping(recipientId, contentId);
  }, []);

  const startContentEdit = useCallback((contentId) => {
    realtimeClient.startContentEdit(contentId);
  }, []);

  const stopContentEdit = useCallback((contentId) => {
    realtimeClient.stopContentEdit(contentId);
  }, []);

  const updateStatus = useCallback((status) => {
    realtimeClient.updateStatus(status);
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    realtimeClient.markNotificationRead(notificationId);
  }, []);

  return {
    connectionStatus,
    // Content events
    onContentCreated,
    onContentUpdated,
    onContentDeleted,
    onContentRated,
    onContentViewed,
    // Chapter events
    onChapterCreated,
    onChapterUpdated,
    onChapterDeleted,
    // User events
    onUserProfileUpdated,
    onUserStatusChanged,
    // Relationship events
    onFriendRequestReceived,
    onFriendRequestAccepted,
    onFriendRequestRejected,
    onFriendshipEnded,
    // Calendar events
    onCalendarEventCreated,
    onCalendarEventUpdated,
    onCalendarEventDeleted,
    onCalendarInviteReceived,
    // Media events
    onMediaUploaded,
    onMediaUpdated,
    onMediaDeleted,
    // Album events
    onAlbumCreated,
    onAlbumUpdated,
    onAlbumDeleted,
    // Diary events
    onDiaryEntryCreated,
    onDiaryEntryUpdated,
    onDiaryEntryDeleted,
    // Chat events
    onMessage,
    onMessageSent,
    onMessageReceived,
    // Payment events
    onPaymentCompleted,
    onSubscriptionUpdated,
    // Ad events
    onAdViewLogged,
    // Notification events
    onNotification,
    onNotificationRead,
    onAnnouncement,
    // Collaboration events
    onUserTyping,
    onUserEditing,
    // Connection events
    onConnectionStatus,
    onError,
    // Room management
    joinContentRoom,
    leaveContentRoom,
    joinCalendarRoom,
    leaveCalendarRoom,
    joinMediaRoom,
    joinAlbumRoom,
    joinDiaryRoom,
    // Actions
    sendMessage,
    startTyping,
    stopTyping,
    startContentEdit,
    stopContentEdit,
    updateStatus,
    markNotificationRead
  };
};

export default useRealtime;