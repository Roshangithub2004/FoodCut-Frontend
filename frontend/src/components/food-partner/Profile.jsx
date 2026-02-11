import React, { useState, useEffect } from 'react'
import '../../styles/theme.css'
import '../../styles/foodPartnerProfile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
    const {id} = useParams()
    const [profile, setProfile] = useState(null)

    const [videos, setVideos] = useState([])

  useEffect(()=>{
    axios.get(`http://localhost:3000/api/food-partner/${id}`, {withCredentials:true})
    .then(response =>{
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner.foodItems)
    })
    .catch(err => {
        console.log('Profile fetch error:', err.response?.data || err.message)
    })
    
  }, [id])
    
  return (
    <div className="fp-profile-page">
      <section className="fp-profile-card">
        <div className="fp-profile-top">
          <img className="fp-avatar" aria-hidden="true" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGrKlBcAbAJZKueIujU8OZCyoII0Rzpwx_RuLPHHKwRM9hdnW2QkcEUh38nD3oXaSZUUic9hi83dOfGEUM4G79nKIJTWUtAWrYodldDZ4&s=10" alt="" />
          <div className="fp-info">
            <div className="fp-pill">{profile?.businessName}</div>
            <div className="fp-pill fp-pill-muted">{profile?.address}</div>
          </div>
        </div>

        <div className="fp-stats">
          <div className="fp-stat">
            <div className="fp-stat-label">total meals</div>
            <div className="fp-stat-value">{profile?.totalMeals}</div>
          </div>
          <div className="fp-stat">
            <div className="fp-stat-label">customer serve</div>
            <div className="fp-stat-value">{profile?.customersServed}</div>
          </div>
        </div>
      </section>
    <div className="fp-divider" />

      <section className="fp-grid">
        {videos.map((item, idx) => (
          <div className="fp-tile" key={item._id || idx}>
            
              <video src={item.video} muted></video>

          </div>
        ))}
      </section>
    </div>
  )
}

export default Profile
