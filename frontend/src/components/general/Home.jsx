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
      setVideos(response.data.foodItem)
    })
  },[])

  return (
  <div className="reels-container">
    {videos.map((video, idx) => (
      
      <div className="reel" key={idx}>
        {/* {console.log('VIDEO URL:', video)} */}
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
          <div className="reel-description">{video.description}</div>
          <button className="reel-btn" onClick={() =>navigate('/food-partner/' + video.foodPartner)}>
            Visit store
          </button>
        </div>
      </div>
    ))}
  </div>
);
}
export default Home;
