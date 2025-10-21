import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import realtimeService from '../services/realtimeService.js';

const router = express.Router();

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Relationships API test successful', user: req.user });
});

router.post('/friend-request', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (sender.friends.includes(recipientId) || recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if a request is already pending from sender to recipient
    const existingRequest = recipient.friendRequests.find(
      (req) => req.sender.toString() === senderId && req.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if a request is already pending from recipient to sender
    const reverseRequest = sender.friendRequests.find(
      (req) => req.sender.toString() === recipientId && req.status === 'pending'
    );
    if (reverseRequest) {
      return res.status(400).json({ message: 'Recipient has already sent you a friend request' });
    }

    recipient.friendRequests.push({ sender: senderId, status: 'pending' });
    await recipient.save();

    // Emit realtime event
    realtimeService.emitFriendRequestSent(senderId, recipientId, { 
      sender: senderId, 
      recipient: recipientId, 
      status: 'pending' 
    });

    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/friend-request/:requestId/accept', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req._id.toString() === requestId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found or not pending' });
    }

    const senderId = user.friendRequests[requestIndex].sender;
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Add to friends list for both users
    user.friends.push(senderId);
    sender.friends.push(userId);

    // Remove the request
    user.friendRequests.splice(requestIndex, 1);

    await user.save();
    await sender.save();

    // Emit realtime event
    realtimeService.emitFriendRequestAccepted(senderId, userId);

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/friend-request/:requestId/reject', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req._id.toString() === requestId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found or not pending' });
    }

    const senderId = user.friendRequests[requestIndex].sender;
    
    // Remove the request
    user.friendRequests.splice(requestIndex, 1);

    await user.save();

    // Emit realtime event
    realtimeService.emitFriendRequestRejected(senderId, userId);

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/friends/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friend from user's friends list
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    // Remove user from friend's friends list
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    // Emit realtime event
    realtimeService.emitFriendshipEnded(userId, friendId);

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar, bio, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (avatar !== undefined) user.profile.avatar = avatar;
    if (bio !== undefined) user.profile.bio = bio;
    if (status !== undefined) user.profile.status = status;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', profile: user.profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -friendRequests -friends -partner'); // Exclude sensitive info
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/partner-request', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Cannot send partner request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if sender is already in a relationship
    if (sender.profile.status === 'in_relationship' || sender.partner) {
      return res.status(400).json({ message: 'You are already in a relationship' });
    }

    // Check if recipient is already in a relationship
    if (recipient.profile.status === 'in_relationship' || recipient.partner) {
      return res.status(400).json({ message: 'Recipient is already in a relationship' });
    }

    // Check if a partner request is already pending from sender to recipient
    const existingRequest = recipient.friendRequests.find(
      (req) => req.sender.toString() === senderId && req.status === 'pending' && req.type === 'partner'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Partner request already sent' });
    }

    // Check if a partner request is already pending from recipient to sender
    const reverseRequest = sender.friendRequests.find(
      (req) => req.sender.toString() === recipientId && req.status === 'pending' && req.type === 'partner'
    );
    if (reverseRequest) {
      return res.status(400).json({ message: 'Recipient has already sent you a partner request' });
    }

    recipient.friendRequests.push({ sender: senderId, status: 'pending', type: 'partner' });
    await recipient.save();

    res.status(200).json({ message: 'Partner request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/partner-request/:requestId/accept', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req._id.toString() === requestId && req.status === 'pending' && req.type === 'partner'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Partner request not found or not pending' });
    }

    const senderId = user.friendRequests[requestIndex].sender;
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check if either user is already in a relationship
    if (user.partner || sender.partner) {
      return res.status(400).json({ message: 'One of the users is already in a relationship' });
    }

    // Establish partner relationship
    user.partner = senderId;
    user.profile.status = 'in_relationship';
    sender.partner = userId;
    sender.profile.status = 'in_relationship';

    // Remove the request
    user.friendRequests.splice(requestIndex, 1);

    await user.save();
    await sender.save();

    res.status(200).json({ message: 'Partner request accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/partner-request/:requestId/reject', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req._id.toString() === requestId && req.status === 'pending' && req.type === 'partner'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Partner request not found or not pending' });
    }

    // Remove the request
    user.friendRequests.splice(requestIndex, 1);

    await user.save();

    res.status(200).json({ message: 'Partner request rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/partner', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.partner) {
      return res.status(400).json({ message: 'You are not currently in a partnership' });
    }

    const partnerId = user.partner;
    const partner = await User.findById(partnerId);

    if (partner) {
      partner.partner = null;
      partner.profile.status = 'single';
      await partner.save();
    }

    user.partner = null;
    user.profile.status = 'single';
    await user.save();

    res.status(200).json({ message: 'Partnership dissolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
