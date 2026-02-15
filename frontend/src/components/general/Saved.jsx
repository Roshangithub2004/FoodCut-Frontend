import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/reel.css';
import '../../styles/theme.css';
import axios from 'axios';
import { readSavedVideos, toggleSavedVideo, writeSavedVideos } from '../../utils/savedVideos';
import { API_BASE_URL } from '../../config/api';

const getCount = (value) => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getSaveCount = (video) =>
  getCount(video?.saveCount ?? video?.savedCount ?? video?.saves ?? video?.bookmarks);

const getShareCount = (video) =>
  getCount(video?.shareCount ?? video?.shares ?? video?.sharesCount);

const getCommentCount = (video) =>
  getCount(video?.commentCount ?? video?.commentsCount ?? video?.comments);

const getShareUrl = (video) => {
  const origin = window.location.origin;
  const videoId = video?._id;
  if (videoId) return `${origin}/?video=${videoId}`;
  return window.location.href;
};

const normalizeVideo = (video) => ({
  ...video,
  likeCount: typeof video?.likeCount === 'number' ? video.likeCount : getCount(video?.likeCount),
  isLiked: Boolean(video?.isLiked),
  saveCount: typeof video?.saveCount === 'number' ? video.saveCount : getSaveCount(video),
  isSaved: true,
});

const pickLikeCount = (apiLikeCount, optimisticIsLiked, optimisticLikeCount) => {
  if (typeof apiLikeCount !== 'number') return optimisticLikeCount;
  if (optimisticIsLiked && apiLikeCount === 0) return optimisticLikeCount;
  return apiLikeCount;
};

const Saved = () => {
  const navigate = useNavigate();
  const [savedVideos, setSavedVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const viewerRef = useRef(null);
  const hasInitializedViewerPosition = useRef(false);
  const [activeCommentsFoodId, setActiveCommentsFoodId] = useState(null);
  const [commentsByFoodId, setCommentsByFoodId] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const setSavedVideosAndPersist = (updater) => {
    setSavedVideos((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeSavedVideos(next);
      return next;
    });
  };

  useEffect(() => {
    const saved = readSavedVideos().map((video) => normalizeVideo(video));
    setSavedVideos(saved);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null || !viewerRef.current) return;
    if (hasInitializedViewerPosition.current) return;
    viewerRef.current.scrollTop = startIndex * viewerRef.current.clientHeight;
    hasInitializedViewerPosition.current = true;
  }, [activeIndex, startIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      hasInitializedViewerPosition.current = false;
      setActiveCommentsFoodId(null);
      setCommentsError('');
      setCommentInput('');
    }
  }, [activeIndex]);

  const likeVideo = async (item) => {
    if (!item?._id) return;

    const current = savedVideos.find((video) => video._id === item._id);
    const currentlyLiked = Boolean(current?.isLiked);
    const currentLikeCount = getCount(current?.likeCount);
    const optimisticIsLiked = !currentlyLiked;
    const optimisticLikeCount = optimisticIsLiked
      ? currentLikeCount + 1
      : Math.max(0, currentLikeCount - 1);

    setSavedVideosAndPersist((prev) =>
      prev.map((video) =>
        video._id === item._id
          ? { ...video, isLiked: optimisticIsLiked, likeCount: optimisticLikeCount }
          : video
      )
    );

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/food/like`,
        { foodId: item._id },
        { withCredentials: true }
      );

      const isLikedFromApi = response?.data?.isLiked;
      const likeCountFromApi = response?.data?.likeCount;
      const updatedFood = response?.data?.foodItem ?? null;

      setSavedVideosAndPersist((prev) =>
        prev.map((video) => {
          if (video._id !== item._id) return video;

          if (updatedFood) {
            const nextLikeCount =
              typeof likeCountFromApi === 'number'
                ? pickLikeCount(likeCountFromApi, optimisticIsLiked, optimisticLikeCount)
                : typeof updatedFood?.likeCount === 'number'
                  ? pickLikeCount(updatedFood.likeCount, optimisticIsLiked, optimisticLikeCount)
                  : optimisticLikeCount;

            return normalizeVideo({
              ...video,
              ...updatedFood,
              isLiked:
                typeof isLikedFromApi === 'boolean'
                  ? isLikedFromApi
                  : typeof updatedFood?.isLiked === 'boolean'
                    ? updatedFood.isLiked
                    : optimisticIsLiked,
              likeCount: nextLikeCount,
            });
          }

          if (typeof isLikedFromApi === 'boolean' || typeof likeCountFromApi === 'number') {
            return normalizeVideo({
              ...video,
              isLiked: typeof isLikedFromApi === 'boolean' ? isLikedFromApi : optimisticIsLiked,
              likeCount: pickLikeCount(likeCountFromApi, optimisticIsLiked, optimisticLikeCount),
            });
          }

          return { ...video, isLiked: optimisticIsLiked, likeCount: optimisticLikeCount };
        })
      );
    } catch (error) {
      setSavedVideosAndPersist((prev) =>
        prev.map((video) =>
          video._id === item._id
            ? { ...video, isLiked: currentlyLiked, likeCount: currentLikeCount }
            : video
        )
      );
      console.log('Like toggle error:', error.response?.data || error.message);
    }
  };

  const shareVideo = async (item) => {
    if (!item?._id) return;

    const shareUrl = getShareUrl(item);
    const shareData = {
      title: item?.name || 'Food video',
      text: item?.description || 'Check this reel',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        return;
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.log('Share failed:', error.message || error);
      }
      return;
    }

    const current = savedVideos.find((video) => video._id === item._id);
    const currentShareCount = getShareCount(current);
    const optimisticShareCount = currentShareCount + 1;

    setSavedVideosAndPersist((prev) =>
      prev.map((video) =>
        video._id === item._id ? { ...video, shares: optimisticShareCount } : video
      )
    );

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/food/share`,
        { foodId: item._id, platform: navigator.share ? 'native' : 'copylink' },
        { withCredentials: true }
      );

      const shareCountFromApi =
        response?.data?.shareCount ??
        response?.data?.shares ??
        response?.data?.sharesCount ??
        response?.data?.foodItem?.shareCount ??
        response?.data?.foodItem?.shares;

      if (typeof shareCountFromApi === 'number') {
        setSavedVideosAndPersist((prev) =>
          prev.map((video) =>
            video._id === item._id ? { ...video, shares: shareCountFromApi } : video
          )
        );
      }
    } catch (error) {
      console.log('Share sync error:', error.response?.data || error.message);
    }
  };

  const normalizeComment = (comment) => ({
    _id: comment?._id ?? `${Date.now()}-${Math.random()}`,
    comment: comment?.comment ?? '',
    user: comment?.user ?? null,
    createdAt: comment?.createdAt ?? new Date().toISOString(),
  });

  const openComments = async (item) => {
    if (!item?._id) return;

    setActiveCommentsFoodId(item._id);
    setCommentsError('');
    setCommentsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/comment/food/${item._id}`, {
        withCredentials: true,
      });
      const fetchedComments = Array.isArray(response?.data?.comments)
        ? response.data.comments.map(normalizeComment)
        : [];
      setCommentsByFoodId((prev) => ({ ...prev, [item._id]: fetchedComments }));

      const fetchedCount = fetchedComments.length;
      setSavedVideosAndPersist((prev) =>
        prev.map((video) =>
          video._id === item._id
            ? { ...video, comments: fetchedCount, commentCount: fetchedCount }
            : video
        )
      );
    } catch (error) {
      setCommentsError(error?.response?.data?.message || 'Failed to load comments');
      console.log('Comments fetch error:', error.response?.data || error.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const closeComments = () => {
    setActiveCommentsFoodId(null);
    setCommentInput('');
    setCommentsError('');
  };

  const submitComment = async () => {
    if (!activeCommentsFoodId || isSubmittingComment) return;
    const foodId = activeCommentsFoodId;

    const trimmedComment = commentInput.trim();
    if (!trimmedComment) return;

    const currentComments = commentsByFoodId[foodId] ?? [];
    const currentCount = currentComments.length;

    const optimisticComment = normalizeComment({
      _id: `temp-${Date.now()}`,
      comment: trimmedComment,
      user: { fullName: 'You' },
      createdAt: new Date().toISOString(),
    });
    const optimisticComments = [optimisticComment, ...currentComments];

    setCommentsByFoodId((prev) => ({ ...prev, [foodId]: optimisticComments }));
    setSavedVideosAndPersist((prev) =>
      prev.map((video) =>
        video._id === foodId
          ? { ...video, comments: optimisticComments.length, commentCount: optimisticComments.length }
          : video
      )
    );
    setCommentInput('');
    setIsSubmittingComment(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/comment`,
        { foodId, comment: trimmedComment },
        { withCredentials: true }
      );

      const created = response?.data?.comment ? normalizeComment(response.data.comment) : null;
      setCommentsByFoodId((prev) => {
        const existing = prev[foodId] ?? [];
        const withoutOptimistic = existing.filter((comment) => comment._id !== optimisticComment._id);
        const next = created ? [created, ...withoutOptimistic] : withoutOptimistic;
        return { ...prev, [foodId]: next };
      });
    } catch (error) {
      setCommentsByFoodId((prev) => ({ ...prev, [foodId]: currentComments }));
      setSavedVideosAndPersist((prev) =>
        prev.map((video) =>
          video._id === foodId ? { ...video, comments: currentCount, commentCount: currentCount } : video
        )
      );
      setCommentsError(error?.response?.data?.message || 'Failed to post comment');
      console.log('Comment error:', error.response?.data || error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const bookmarkVideo = (item) => {
    if (!item?._id) return;

    const current = savedVideos.find((video) => video._id === item._id);
    const currentSaveCount = getSaveCount(current);
    const result = toggleSavedVideo({
      ...item,
      isSaved: Boolean(current?.isSaved),
      saveCount: currentSaveCount,
    });
    if (!result.changed) return;

    if (!result.isSaved) {
      const removeIndex = savedVideos.findIndex((video) => video._id === item._id);
      setSavedVideosAndPersist((prev) => prev.filter((video) => video._id !== item._id));

      if (activeIndex !== null && removeIndex !== -1) {
        const nextLength = Math.max(0, savedVideos.length - 1);
        if (nextLength === 0) {
          setActiveIndex(null);
        } else if (removeIndex < activeIndex) {
          setActiveIndex(activeIndex - 1);
        } else if (removeIndex === activeIndex) {
          setActiveIndex(Math.min(activeIndex, nextLength - 1));
        }
      }
      return;
    }

    setSavedVideosAndPersist((prev) =>
      prev.map((video) =>
        video._id === item._id
          ? { ...video, isSaved: true, saveCount: result.saveCount }
          : video
      )
    );
  };

  return (
    <div className="saved-page">
      <div className="saved-content">
        <h2 className="saved-title">Saved</h2>
        {savedVideos.length === 0 ? (
          <p className="saved-subtitle">Your bookmarked reels will appear here.</p>
        ) : (
          <div className="saved-grid">
            {savedVideos.map((video, idx) => (
              <button
                className="saved-grid-tile"
                key={video?._id ?? idx}
                type="button"
                onClick={() => {
                  setStartIndex(idx);
                  setActiveIndex(idx);
                }}
              >
                <video src={video.video} muted preload="metadata" />
              </button>
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && savedVideos[activeIndex] && (
        <div className="saved-viewer">
          <button className="saved-viewer-close" type="button" onClick={() => setActiveIndex(null)}>
            Close
          </button>
          <div
            className="saved-viewer-scroll"
            onScroll={(e) => {
              const viewportHeight = e.currentTarget.clientHeight || 1;
              const raw = Math.round(e.currentTarget.scrollTop / viewportHeight);
              const next = Math.max(0, Math.min(savedVideos.length - 1, raw));
              if (next !== activeIndex) setActiveIndex(next);
            }}
            ref={viewerRef}
          >
            {savedVideos.map((video, idx) => {
              const likesCount = getCount(video?.likeCount);
              const commentsCount = getCommentCount(video);
              const sharesCount = getShareCount(video);
              const savesCount = getSaveCount(video);

              return (
                <div className="saved-viewer-slide" key={video?._id ?? idx}>
                  <video
                    src={video.video}
                    className="saved-viewer-video"
                    controls={false}
                    autoPlay
                    loop
                    muted
                    onError={() => console.log('Video failed to load:', video.video)}
                  />
                  <div className="reel-overlay">
                    <div className="reel-description">{video?.description ?? 'No description'}</div>
                    <button className="reel-btn" onClick={() => navigate('/food-partner/' + video.foodPartner)}>
                      Visit store
                    </button>
                  </div>

                  <div className="reel-actions">
                    <button onClick={() => likeVideo(video)} className="reel-action-btn" type="button" aria-label="Like">
                      <span className="reel-action-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill={video?.isLiked ? 'currentColor' : 'none'} aria-hidden="true">
                          <path d="M12 20s-7-4.438-7-10a4 4 0 0 1 7-2.646A4 4 0 0 1 19 10c0 5.562-7 10-7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="reel-action-text">{likesCount}</span>
                    </button>
                    <button onClick={() => bookmarkVideo(video)} className="reel-action-btn" type="button" aria-label="Save">
                      <span className="reel-action-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill={video?.isSaved ? 'currentColor' : 'none'} aria-hidden="true">
                          <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="reel-action-text">{savesCount}</span>
                    </button>
                    <button onClick={() => openComments(video)} className="reel-action-btn" type="button" aria-label="Comment">
                      <span className="reel-action-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.29 0-2.52-.286-3.625-.798L4 20l.87-4.549A8.463 8.463 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="reel-action-text">{commentsCount}</span>
                    </button>
                    <button onClick={() => shareVideo(video)} className="reel-action-btn" type="button" aria-label="Share">
                      <span className="reel-action-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M14 5h5v5M10 14 19 5M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="reel-action-text">{sharesCount}</span>
                    </button>
                  </div>

                  {activeCommentsFoodId === video?._id && (
                    <div className="reel-comments-sheet" role="dialog" aria-modal="true" aria-label="Comments">
                      <div className="reel-comments-header">
                        <h3>Comments</h3>
                        <button type="button" onClick={closeComments} className="reel-comments-close">
                          Close
                        </button>
                      </div>

                      <div className="reel-comments-list">
                        {commentsLoading ? (
                          <p className="reel-comments-empty">Loading comments...</p>
                        ) : commentsError ? (
                          <p className="reel-comments-empty">{commentsError}</p>
                        ) : (commentsByFoodId[video._id] ?? []).length === 0 ? (
                          <p className="reel-comments-empty">No comments yet.</p>
                        ) : (
                          (commentsByFoodId[video._id] ?? []).map((comment) => (
                            <div className="reel-comment-row" key={comment._id}>
                              <p className="reel-comment-user">
                                {comment?.user?.fullName || comment?.user?.name || comment?.user?.email || 'User'}
                              </p>
                              <p className="reel-comment-text">{comment.comment}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="reel-comments-compose">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(event) => setCommentInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              submitComment();
                            }
                          }}
                          placeholder="Write a comment..."
                          maxLength={300}
                        />
                        <button type="button" onClick={submitComment} disabled={isSubmittingComment}>
                          {isSubmittingComment ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <button className="bottom-nav-item" type="button" onClick={() => navigate('/')}>
          <span className="bottom-nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="bottom-nav-label">Home</span>
        </button>
        <button className="bottom-nav-item active" type="button" onClick={() => navigate('/saved')}>
          <span className="bottom-nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="bottom-nav-label">Saved</span>
        </button>
      </nav>
    </div>
  );
};

export default Saved;
