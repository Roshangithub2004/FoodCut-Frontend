import React from 'react';
import '../../styles/reel.css';
import '../../styles/theme.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const getCount = (value) => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value && typeof value === 'object') {
    if (typeof value.count === 'number') return value.count;
    if (typeof value.total === 'number') return value.total;
    if (typeof value.length === 'number') return value.length;
    if (Array.isArray(value.items)) return value.items.length;
    if (Array.isArray(value.users)) return value.users.length;
  }
  return 0;
};

const getLikesFromVideo = (video) => {
  const possibleLikeValues = [
    video?.likesCount,
    video?.likeCount,
    video?.likes,
    video?.totalLikes,
    video?.like_count,
    video?.like,
    video?.reactions?.likes,
    video?.stats?.likes,
    video?.meta?.likes,
    video?.likedBy,
  ];

  for (const value of possibleLikeValues) {
    if (value !== undefined && value !== null) {
      return getCount(value);
    }
  }

  return 0;
};

const getVideosFromResponse = (response) =>
  response?.data?.foodItem ?? response?.data?.foods ?? response?.data?.data ?? [];

const hasValue = (value) => value !== undefined && value !== null;

const Home = () =>{

  const navigate = useNavigate()
  const [videos, setVideos] = useState([])

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/food', { withCredentials: true });
        if (!cancelled) {
          const loadedVideos = getVideosFromResponse(response).map((video) => ({
            ...video,
            likesCount: getLikesFromVideo(video),
          }));
          setVideos(loadedVideos);
        }
      } catch (error) {
        if (!cancelled) console.log('Food fetch error:', error.response?.data || error.message);
      }
    };

    loadVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const likeVideo = async(item)=>{
    if(!item?._id) return;

    const current = videos.find((v) => v._id === item._id);
    const currentlyLiked = Boolean(current?.isLiked);

    try {
      const response = await axios.post('http://localhost:3000/api/food/like', {foodId:item._id}, {withCredentials:true});
      const updatedFood = response?.data?.foodItem ?? response?.data?.food ?? null;
      const likedFromResponse = response?.data?.liked;
      const responseCountRaw =
        response?.data?.likesCount ??
        response?.data?.likeCount ??
        response?.data?.likes ??
        response?.data?.totalLikes ??
        response?.data?.like_count ??
        response?.data?.likedBy;
      const hasResponseCount = hasValue(responseCountRaw);
      const responseLikesCount = getCount(responseCountRaw);

      setVideos((prev) =>
        prev.map((v) => {
          if (v._id !== item._id) return v;

          if (updatedFood) {
            const merged = { ...v, ...updatedFood };
            if (typeof likedFromResponse === 'boolean') merged.isLiked = likedFromResponse;
            merged.likesCount = hasResponseCount ? responseLikesCount : getLikesFromVideo(merged);
            return merged;
          }

          const likesCount = getLikesFromVideo(v);
          if (hasResponseCount) {
            return {
              ...v,
              isLiked: typeof likedFromResponse === 'boolean' ? likedFromResponse : !currentlyLiked,
              likesCount: responseLikesCount,
            };
          }
          if (currentlyLiked) {
            return { ...v, isLiked: false, likesCount: Math.max(0, likesCount - 1) };
          }
          return { ...v, isLiked: true, likesCount: likesCount + 1 };
        })
      );

    } catch (error) {
      console.log('Like toggle error:', error.response?.data || error.message);
    }

  }

  return (
  <div className="reels-container">
    {videos.map((video, idx) => {
      const likesCount = getLikesFromVideo(video);
      const commentsCount = getCount(video?.comments);
      const bookmarksCount = getCount(video?.bookmarks ?? video?.saved);
      const sharesCount = getCount(video?.shares);

      return (
      
      <div className="reel" key={idx}>
        {/* {console.log('VIDEO URL:', video.description)} */}
        {/* {console.log(`http://localhost:3000/${video.video}`)} */}
        <video
          src={video.video}
          className="reel-video"
          controls={false}
          autoPlay
          loop
          muted
          onError={() => console.log('Video failed to load:', video.video)}
        />
        <div className="reel-overlay">
          <div className="reel-description">{video?.description?? 'No description'}</div>
          <button className="reel-btn" onClick={() =>navigate('/food-partner/' + video.foodPartner)}>
            Visit store
          </button>
        </div>

        <div className="reel-actions">
          <button onClick={() => likeVideo(video)} className="reel-action-btn" type="button" aria-label="Like">
            <span className="reel-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20s-7-4.438-7-10a4 4 0 0 1 7-2.646A4 4 0 0 1 19 10c0 5.562-7 10-7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">{likesCount}</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Save">
            <span className="reel-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">{bookmarksCount}</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Comment">
            <span className="reel-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.29 0-2.52-.286-3.625-.798L4 20l.87-4.549A8.463 8.463 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">{commentsCount}</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Share">
            <span className="reel-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 5h5v5M10 14 19 5M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">{sharesCount}</span>
          </button>
        </div>
      </div>
      );
    })}

    <nav className="bottom-nav" aria-label="Bottom navigation">
      <button className="bottom-nav-item active" type="button" onClick={() => navigate('/')}>
        <span className="bottom-nav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="bottom-nav-label">Home</span>
      </button>
      <button className="bottom-nav-item" type="button" onClick={() => navigate('/saved')}>
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
}
export default Home;
