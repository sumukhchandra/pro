import { Content } from '../models/Content.js';
import { Channel } from '../models/Channel.js';

export async function seedInitialData() {
  const contentCount = await Content.estimatedDocumentCount();
  if (contentCount === 0) {
    await Content.insertMany([
      { title: 'Auric Dawn', author: 'L. Aurelius', type: 'novel', tags: ['Fantasy'], description: 'A gilded epic.', coverImageURL: '' },
      { title: 'Golem Gold', author: 'S. Argent', type: 'comic', tags: ['Action'], coverImageURL: '' },
      { title: 'Midas Pages', author: 'E. Orum', type: 'ebook', tags: ['Drama'] },
      { title: 'Shining Ink', author: 'K. Kintsugi', type: 'manga', tags: ['Adventure'] }
    ]);
  }
  const channelCount = await Channel.estimatedDocumentCount();
  if (channelCount === 0) {
    await Channel.insertMany([
      { name: 'General Discussion', description: 'Talk about all things books.' },
      { name: 'Comic Talk', description: 'Discuss comics.' },
      { name: 'Writing Prompts', description: 'Share and write prompts.' }
    ]);
  }
}
