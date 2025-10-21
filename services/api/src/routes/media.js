import express from 'express';
import Media from '../models/Media.js';
import Album from '../models/Album.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be stored in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and Videos Only!');
    }
  },
});

// Placeholder route for testing authentication and router setup
router.get('/test', auth, (req, res) => {
  res.json({ message: 'Media API test successful', user: req.user });
});

router.post('/upload', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { caption, albumId, visibility, type } = req.body;
    const owner = req.user.id;

    const newMedia = await Media.create({
      owner,
      url: `/uploads/${req.file.filename}`,
      type: type || (req.file.mimetype.startsWith('image') ? 'image' : 'video'),
      caption,
      album: albumId || null,
      visibility,
    });

    // If an albumId is provided, add media to the album
    if (albumId) {
      const album = await Album.findById(albumId);
      if (album) {
        // Assuming Album model has a 'media' array to store media IDs
        // If not, we might need to update the Album model or handle this differently
        // For now, we'll just link media to album via media.album field
      }
    }

    res.status(201).json({ message: 'Media uploaded successfully', media: newMedia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/albums', auth, async (req, res) => {
  try {
    const { title, description, visibility } = req.body;
    const owner = req.user.id;

    const newAlbum = await Album.create({
      owner,
      title,
      description,
      visibility,
      contributors: [owner], // Owner is automatically a contributor
    });

    res.status(201).json({ message: 'Album created successfully', album: newAlbum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const media = await Media.find({
      owner: userId,
    })
      .populate('owner', 'username profile.avatar');

    // Also find media in albums where user is a contributor
    const contributedAlbums = await Album.find({ contributors: userId });
    const contributedMedia = await Media.find({ album: { $in: contributedAlbums.map(album => album._id) } })
      .populate('owner', 'username profile.avatar');

    res.status(200).json([...media, ...contributedMedia]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/albums', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const albums = await Album.find({
      $or: [
        { owner: userId },
        { contributors: userId },
      ],
    })
      .populate('owner', 'username profile.avatar')
      .populate('contributors', 'username profile.avatar');

    res.status(200).json(albums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const media = await Media.findById(mediaId)
      .populate('owner', 'username profile.avatar')
      .populate('comments.user', 'username profile.avatar')
      .populate('reactions.user', 'username profile.avatar');

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Check permissions
    const isOwner = media.owner._id.toString() === userId;
    let hasAccess = isOwner;

    if (media.album) {
      const album = await Album.findById(media.album);
      if (album && (album.owner.toString() === userId || album.contributors.some(c => c.toString() === userId))) {
        hasAccess = true;
      }
    }

    if (media.visibility === 'private' && !hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Further checks for 'friends' or 'partner' visibility can be added here if needed

    res.status(200).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/albums/:albumId', auth, async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;

    const album = await Album.findById(albumId)
      .populate('owner', 'username profile.avatar')
      .populate('contributors', 'username profile.avatar');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Check permissions
    const isOwner = album.owner._id.toString() === userId;
    const isContributor = album.contributors.some(c => c._id.toString() === userId);

    if (album.visibility === 'private' && !isOwner && !isContributor) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Further checks for 'friends' or 'partner' visibility can be added here if needed

    const mediaInAlbum = await Media.find({ album: albumId })
      .populate('owner', 'username profile.avatar');

    res.status(200).json({ album, media: mediaInAlbum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;
    const { caption, albumId, visibility, type } = req.body;

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not media owner' });
    }

    media.caption = caption !== undefined ? caption : media.caption;
    media.album = albumId !== undefined ? albumId : media.album;
    media.visibility = visibility !== undefined ? visibility : media.visibility;
    media.type = type !== undefined ? type : media.type;

    await media.save();

    res.status(200).json({ message: 'Media updated successfully', media });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:mediaId', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not media owner' });
    }

    // Optionally, delete the file from storage as well
    // fs.unlinkSync(path.join(__dirname, '../uploads', media.url.split('/').pop()));

    await media.deleteOne();

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/albums/:albumId', auth, async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;
    const { title, description, visibility } = req.body;

    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not album owner' });
    }

    album.title = title !== undefined ? title : album.title;
    album.description = description !== undefined ? description : album.description;
    album.visibility = visibility !== undefined ? visibility : album.visibility;

    await album.save();

    res.status(200).json({ message: 'Album updated successfully', album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/albums/:albumId', auth, async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.user.id;

    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not album owner' });
    }

    // Set album field to null for all media associated with this album
    await Media.updateMany({ album: albumId }, { $set: { album: null } });

    await album.deleteOne();

    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/albums/:albumId/contributors', auth, async (req, res) => {
  try {
    const { albumId } = req.params;
    const { contributorId } = req.body;
    const userId = req.user.id;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not album owner' });
    }

    if (album.contributors.includes(contributorId)) {
      return res.status(400).json({ message: 'User is already a contributor' });
    }

    album.contributors.push(contributorId);
    await album.save();

    res.status(200).json({ message: 'Contributor added successfully', album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/albums/:albumId/contributors/:contributorId', auth, async (req, res) => {
  try {
    const { albumId, contributorId } = req.params;
    const userId = req.user.id;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: Not album owner' });
    }

    if (album.owner.toString() === contributorId) {
      return res.status(400).json({ message: 'Cannot remove owner as contributor' });
    }

    album.contributors = album.contributors.filter(c => c.toString() !== contributorId);
    await album.save();

    res.status(200).json({ message: 'Contributor removed successfully', album });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:mediaId/comments', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Basic access check (can be expanded based on media visibility)
    if (media.visibility === 'private' && media.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    media.comments.push({ user: userId, text });
    await media.save();

    res.status(201).json({ message: 'Comment added successfully', comment: media.comments[media.comments.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:mediaId/reactions', auth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { type } = req.body; // e.g., 'like', 'heart'
    const userId = req.user.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Basic access check (can be expanded based on media visibility)
    if (media.visibility === 'private' && media.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent duplicate reactions from the same user for the same type
    const existingReactionIndex = media.reactions.findIndex(r => r.user.toString() === userId && r.type === type);
    if (existingReactionIndex > -1) {
      media.reactions.splice(existingReactionIndex, 1); // Toggle reaction off
      await media.save();
      return res.status(200).json({ message: 'Reaction removed successfully' });
    } else {
      media.reactions.push({ user: userId, type });
      await media.save();
      return res.status(201).json({ message: 'Reaction added successfully', reaction: media.reactions[media.reactions.length - 1] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
