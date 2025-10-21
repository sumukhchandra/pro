import React, { useState, useEffect } from 'react';
import useRealtime from '../hooks/useRealtime';

// Example React component showing how to use realtime functionality
const RealtimeExample = ({ token, serverUrl }) => {
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [editingUsers, setEditingUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState({ connected: false });

  const {
    // Connection status
    connectionStatus: realtimeStatus,
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
  } = useRealtime(token, serverUrl);

  // Setup event listeners
  useEffect(() => {
    // Connection status
    const unsubscribeConnection = onConnectionStatus((status) => {
      setConnectionStatus(status);
      console.log('Connection status changed:', status);
    });

    // Content events
    const unsubscribeContentCreated = onContentCreated((data) => {
      console.log('New content created:', data);
      addNotification('New content created', 'info');
    });

    const unsubscribeContentUpdated = onContentUpdated((data) => {
      console.log('Content updated:', data);
      addNotification('Content updated', 'info');
    });

    const unsubscribeContentDeleted = onContentDeleted((data) => {
      console.log('Content deleted:', data);
      addNotification('Content deleted', 'warning');
    });

    const unsubscribeContentRated = onContentRated((data) => {
      console.log('Content rated:', data);
      addNotification('Content rated', 'info');
    });

    const unsubscribeContentViewed = onContentViewed((data) => {
      console.log('Content viewed:', data);
      // Update view count in UI if needed
    });

    // Chapter events
    const unsubscribeChapterCreated = onChapterCreated((data) => {
      console.log('New chapter created:', data);
      addNotification('New chapter created', 'info');
    });

    const unsubscribeChapterUpdated = onChapterUpdated((data) => {
      console.log('Chapter updated:', data);
      addNotification('Chapter updated', 'info');
    });

    const unsubscribeChapterDeleted = onChapterDeleted((data) => {
      console.log('Chapter deleted:', data);
      addNotification('Chapter deleted', 'warning');
    });

    // User events
    const unsubscribeUserProfileUpdated = onUserProfileUpdated((data) => {
      console.log('User profile updated:', data);
      addNotification('Profile updated', 'info');
    });

    const unsubscribeUserStatusChanged = onUserStatusChanged((data) => {
      console.log('User status changed:', data);
      if (data.status === 'online') {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      } else if (data.status === 'offline') {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Relationship events
    const unsubscribeFriendRequestReceived = onFriendRequestReceived((data) => {
      console.log('Friend request received:', data);
      addNotification('New friend request received', 'info');
    });

    const unsubscribeFriendRequestAccepted = onFriendRequestAccepted((data) => {
      console.log('Friend request accepted:', data);
      addNotification('Friend request accepted', 'success');
    });

    const unsubscribeFriendRequestRejected = onFriendRequestRejected((data) => {
      console.log('Friend request rejected:', data);
      addNotification('Friend request rejected', 'warning');
    });

    const unsubscribeFriendshipEnded = onFriendshipEnded((data) => {
      console.log('Friendship ended:', data);
      addNotification('Friendship ended', 'warning');
    });

    // Calendar events
    const unsubscribeCalendarEventCreated = onCalendarEventCreated((data) => {
      console.log('Calendar event created:', data);
      addNotification('New calendar event created', 'info');
    });

    const unsubscribeCalendarEventUpdated = onCalendarEventUpdated((data) => {
      console.log('Calendar event updated:', data);
      addNotification('Calendar event updated', 'info');
    });

    const unsubscribeCalendarEventDeleted = onCalendarEventDeleted((data) => {
      console.log('Calendar event deleted:', data);
      addNotification('Calendar event deleted', 'warning');
    });

    const unsubscribeCalendarInviteReceived = onCalendarInviteReceived((data) => {
      console.log('Calendar invite received:', data);
      addNotification('New calendar invite received', 'info');
    });

    // Media events
    const unsubscribeMediaUploaded = onMediaUploaded((data) => {
      console.log('Media uploaded:', data);
      addNotification('Media uploaded', 'info');
    });

    const unsubscribeMediaUpdated = onMediaUpdated((data) => {
      console.log('Media updated:', data);
      addNotification('Media updated', 'info');
    });

    const unsubscribeMediaDeleted = onMediaDeleted((data) => {
      console.log('Media deleted:', data);
      addNotification('Media deleted', 'warning');
    });

    // Album events
    const unsubscribeAlbumCreated = onAlbumCreated((data) => {
      console.log('Album created:', data);
      addNotification('Album created', 'info');
    });

    const unsubscribeAlbumUpdated = onAlbumUpdated((data) => {
      console.log('Album updated:', data);
      addNotification('Album updated', 'info');
    });

    const unsubscribeAlbumDeleted = onAlbumDeleted((data) => {
      console.log('Album deleted:', data);
      addNotification('Album deleted', 'warning');
    });

    // Diary events
    const unsubscribeDiaryEntryCreated = onDiaryEntryCreated((data) => {
      console.log('Diary entry created:', data);
      addNotification('Diary entry created', 'info');
    });

    const unsubscribeDiaryEntryUpdated = onDiaryEntryUpdated((data) => {
      console.log('Diary entry updated:', data);
      addNotification('Diary entry updated', 'info');
    });

    const unsubscribeDiaryEntryDeleted = onDiaryEntryDeleted((data) => {
      console.log('Diary entry deleted:', data);
      addNotification('Diary entry deleted', 'warning');
    });

    // Chat events
    const unsubscribeMessage = onMessage((data) => {
      console.log('Message received:', data);
      addNotification('New message received', 'info');
    });

    const unsubscribeMessageSent = onMessageSent((data) => {
      console.log('Message sent:', data);
    });

    const unsubscribeMessageReceived = onMessageReceived((data) => {
      console.log('Message received:', data);
      addNotification('New message received', 'info');
    });

    // Payment events
    const unsubscribePaymentCompleted = onPaymentCompleted((data) => {
      console.log('Payment completed:', data);
      addNotification('Payment completed', 'success');
    });

    const unsubscribeSubscriptionUpdated = onSubscriptionUpdated((data) => {
      console.log('Subscription updated:', data);
      addNotification('Subscription updated', 'info');
    });

    // Ad events
    const unsubscribeAdViewLogged = onAdViewLogged((data) => {
      console.log('Ad view logged:', data);
    });

    // Notification events
    const unsubscribeNotification = onNotification((data) => {
      console.log('Notification received:', data);
      addNotification(data.notification.message, 'info');
    });

    const unsubscribeNotificationRead = onNotificationRead((data) => {
      console.log('Notification read:', data);
    });

    const unsubscribeAnnouncement = onAnnouncement((data) => {
      console.log('Announcement received:', data);
      addNotification(data.announcement.message, 'announcement');
    });

    // Collaboration events
    const unsubscribeUserTyping = onUserTyping((data) => {
      console.log('User typing:', data);
      if (data.isTyping) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    const unsubscribeUserEditing = onUserEditing((data) => {
      console.log('User editing:', data);
      if (data.isEditing) {
        setEditingUsers(prev => new Set([...prev, data.userId]));
      } else {
        setEditingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Error handling
    const unsubscribeError = onError((error) => {
      console.error('Realtime error:', error);
      addNotification('Connection error occurred', 'error');
    });

    // Cleanup
    return () => {
      unsubscribeConnection();
      unsubscribeContentCreated();
      unsubscribeContentUpdated();
      unsubscribeContentDeleted();
      unsubscribeContentRated();
      unsubscribeContentViewed();
      unsubscribeChapterCreated();
      unsubscribeChapterUpdated();
      unsubscribeChapterDeleted();
      unsubscribeUserProfileUpdated();
      unsubscribeUserStatusChanged();
      unsubscribeFriendRequestReceived();
      unsubscribeFriendRequestAccepted();
      unsubscribeFriendRequestRejected();
      unsubscribeFriendshipEnded();
      unsubscribeCalendarEventCreated();
      unsubscribeCalendarEventUpdated();
      unsubscribeCalendarEventDeleted();
      unsubscribeCalendarInviteReceived();
      unsubscribeMediaUploaded();
      unsubscribeMediaUpdated();
      unsubscribeMediaDeleted();
      unsubscribeAlbumCreated();
      unsubscribeAlbumUpdated();
      unsubscribeAlbumDeleted();
      unsubscribeDiaryEntryCreated();
      unsubscribeDiaryEntryUpdated();
      unsubscribeDiaryEntryDeleted();
      unsubscribeMessage();
      unsubscribeMessageSent();
      unsubscribeMessageReceived();
      unsubscribePaymentCompleted();
      unsubscribeSubscriptionUpdated();
      unsubscribeAdViewLogged();
      unsubscribeNotification();
      unsubscribeNotificationRead();
      unsubscribeAnnouncement();
      unsubscribeUserTyping();
      unsubscribeUserEditing();
      unsubscribeError();
    };
  }, [
    onConnectionStatus,
    onContentCreated,
    onContentUpdated,
    onContentDeleted,
    onContentRated,
    onContentViewed,
    onChapterCreated,
    onChapterUpdated,
    onChapterDeleted,
    onUserProfileUpdated,
    onUserStatusChanged,
    onFriendRequestReceived,
    onFriendRequestAccepted,
    onFriendRequestRejected,
    onFriendshipEnded,
    onCalendarEventCreated,
    onCalendarEventUpdated,
    onCalendarEventDeleted,
    onCalendarInviteReceived,
    onMediaUploaded,
    onMediaUpdated,
    onMediaDeleted,
    onAlbumCreated,
    onAlbumUpdated,
    onAlbumDeleted,
    onDiaryEntryCreated,
    onDiaryEntryUpdated,
    onDiaryEntryDeleted,
    onMessage,
    onMessageSent,
    onMessageReceived,
    onPaymentCompleted,
    onSubscriptionUpdated,
    onAdViewLogged,
    onNotification,
    onNotificationRead,
    onAnnouncement,
    onUserTyping,
    onUserEditing,
    onError
  ]);

  // Helper function to add notifications
  const addNotification = (message, type) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only last 10
  };

  // Example functions for using realtime features
  const handleJoinContentRoom = (contentId) => {
    joinContentRoom(contentId);
    console.log(`Joined content room: ${contentId}`);
  };

  const handleLeaveContentRoom = (contentId) => {
    leaveContentRoom(contentId);
    console.log(`Left content room: ${contentId}`);
  };

  const handleSendMessage = (recipientId, content) => {
    sendMessage(recipientId, content);
    console.log(`Sent message to ${recipientId}: ${content}`);
  };

  const handleStartTyping = (recipientId, contentId) => {
    startTyping(recipientId, contentId);
    console.log(`Started typing in ${contentId}`);
  };

  const handleStopTyping = (recipientId, contentId) => {
    stopTyping(recipientId, contentId);
    console.log(`Stopped typing in ${contentId}`);
  };

  const handleStartContentEdit = (contentId) => {
    startContentEdit(contentId);
    console.log(`Started editing content: ${contentId}`);
  };

  const handleStopContentEdit = (contentId) => {
    stopContentEdit(contentId);
    console.log(`Stopped editing content: ${contentId}`);
  };

  const handleUpdateStatus = (status) => {
    updateStatus(status);
    console.log(`Updated status to: ${status}`);
  };

  const handleMarkNotificationRead = (notificationId) => {
    markNotificationRead(notificationId);
    console.log(`Marked notification as read: ${notificationId}`);
  };

  return (
    <div className="realtime-example">
      <h2>Realtime Example</h2>
      
      {/* Connection Status */}
      <div className="connection-status">
        <h3>Connection Status</h3>
        <p>Status: {realtimeStatus.connected ? 'Connected' : 'Disconnected'}</p>
        <p>Socket ID: {realtimeStatus.socket || 'N/A'}</p>
      </div>

      {/* Online Users */}
      <div className="online-users">
        <h3>Online Users</h3>
        <p>Count: {onlineUsers.size}</p>
        <ul>
          {Array.from(onlineUsers).map(userId => (
            <li key={userId}>User {userId}</li>
          ))}
        </ul>
      </div>

      {/* Typing Users */}
      <div className="typing-users">
        <h3>Typing Users</h3>
        <p>Count: {typingUsers.size}</p>
        <ul>
          {Array.from(typingUsers).map(userId => (
            <li key={userId}>User {userId} is typing...</li>
          ))}
        </ul>
      </div>

      {/* Editing Users */}
      <div className="editing-users">
        <h3>Editing Users</h3>
        <p>Count: {editingUsers.size}</p>
        <ul>
          {Array.from(editingUsers).map(userId => (
            <li key={userId}>User {userId} is editing...</li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      <div className="notifications">
        <h3>Notifications</h3>
        <div className="notification-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification notification-${notification.type}`}
            >
              <span>{notification.message}</span>
              <button onClick={() => handleMarkNotificationRead(notification.id)}>
                Mark as Read
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Example Controls */}
      <div className="example-controls">
        <h3>Example Controls</h3>
        <button onClick={() => handleJoinContentRoom('content123')}>
          Join Content Room
        </button>
        <button onClick={() => handleLeaveContentRoom('content123')}>
          Leave Content Room
        </button>
        <button onClick={() => handleSendMessage('user123', 'Hello!')}>
          Send Message
        </button>
        <button onClick={() => handleStartTyping('user123', 'content123')}>
          Start Typing
        </button>
        <button onClick={() => handleStopTyping('user123', 'content123')}>
          Stop Typing
        </button>
        <button onClick={() => handleStartContentEdit('content123')}>
          Start Content Edit
        </button>
        <button onClick={() => handleStopContentEdit('content123')}>
          Stop Content Edit
        </button>
        <button onClick={() => handleUpdateStatus('online')}>
          Update Status
        </button>
      </div>
    </div>
  );
};

export default RealtimeExample;