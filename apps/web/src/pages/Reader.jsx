import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Reader = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isPro = user?.userRole === 'pro';
  const [content, setContent] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterNum, setChapterNum] = useState(1);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(false);

  // on content open
  useEffect(() => {
    (async () => {
      try {
        const detail = await apiFetch(`/api/content/${id}`);
        setContent(detail);
        await apiFetch(`/api/content/${id}/open`, { method: 'POST' });
        const list = await apiFetch(`/api/chapters/${id}/list`);
        setChapters(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  // load chapter and handle ad between chapters
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (!isPro && chapterNum !== 1) {
          // show ad before loading chapter 2+ for standard users
          setShowAd(true);
          await apiFetch('/api/ads/log', { method: 'POST', body: { contentId: id, adPlacement: 'onChapterBreak' } });
          await new Promise((r) => setTimeout(r, 1200));
          setShowAd(false);
        }
        const ch = await apiFetch(`/api/chapters/${id}?chapter=${chapterNum}`);
        setChapter(ch);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [chapterNum, id, isPro]);

  // ad on page load for standard users
  useEffect(() => {
    (async () => {
      if (!isPro) {
        setShowAd(true);
        try { await apiFetch('/api/ads/log', { method: 'POST', body: { contentId: id, adPlacement: 'onContentOpen' } }); } catch {}
        await new Promise((r) => setTimeout(r, 1500));
        setShowAd(false);
      }
    })();
  }, [id, isPro]);

  if (loading && !chapter) return <div>Loading reader...</div>;
  if (!content) return <div>Content not found</div>;

  const next = () => setChapterNum((n) => n + 1);
  const prev = () => setChapterNum((n) => Math.max(1, n - 1));

  return (
    <div>
      {showAd && (
        <div className="fixed inset-0 bg-black/70 text-white flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded shadow">Advertisement…</div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">{content.title}</h1>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="px-3 py-1 bg-gray-100 rounded">Previous</button>
          <span>Chapter {chapterNum}</span>
          <button onClick={next} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
        {chapter?.chapterType === 'text' ? (
          <article className="prose max-w-none whitespace-pre-wrap">{chapter.textContent}</article>
        ) : (
          <div className="space-y-2">{chapter?.imageURLs?.map((url, i) => (<img key={i} src={url} alt={`page-${i}`} className="w-full" />))}</div>
        )}
      </div>
    </div>
  );
};

export default Reader;
