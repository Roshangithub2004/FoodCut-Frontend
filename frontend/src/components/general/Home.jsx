import React from 'react';
import '../../styles/reel.css';
import '../../styles/theme.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';


const Home = () =>{

  const navigate = useNavigate()
  const [videos, setVideos] = useState([])

  useEffect(()=>{
    axios.get('http://localhost:3000/api/food', {withCredentials:true})
    .then(response =>{
      // console.log(response.data.foodItem)
      setVideos(response.data?.foodItem?? [])
    })
  },[])

  return (
  <div className="reels-container">
    {videos.map((video, idx) => (
      
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
          <button className="reel-action-btn" type="button" aria-label="Like">
            <span className="reel-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 20s-7-4.438-7-10a4 4 0 0 1 7-2.646A4 4 0 0 1 19 10c0 5.562-7 10-7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">Likes</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Save">
            <span className="reel-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">Save</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Comment">
            <span className="reel-action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.29 0-2.52-.286-3.625-.798L4 20l.87-4.549A8.463 8.463 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">Comments</span>
          </button>
          <button className="reel-action-btn" type="button" aria-label="Share">
            <span className="reel-action-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14 5h5v5M10 14 19 5M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="reel-action-text">Share</span>
          </button>
        </div>
      </div>
    ))}

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
