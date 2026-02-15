import React, { useState, useEffect, useRef } from 'react'
import '../../styles/theme.css'
import '../../styles/foodPartnerProfile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const Profile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [activeIndex, setActiveIndex] = useState(null)
  const [startIndex, setStartIndex] = useState(0)
  const viewerRef = useRef(null)
  const hasInitializedViewerPosition = useRef(false)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/food-partner/${id}`, {withCredentials:true})
    .then(response => {
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner.foodItems || [])
    })
    .catch(err => {
        console.log('Profile fetch error:', err.response?.data || err.message)
    })
    
  }, [id])

  useEffect(() => {
    if (activeIndex === null) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null || !viewerRef.current) return
    if (hasInitializedViewerPosition.current) return
    viewerRef.current.scrollTop = startIndex * viewerRef.current.clientHeight
    hasInitializedViewerPosition.current = true
  }, [activeIndex, startIndex])

  useEffect(() => {
    if (activeIndex === null) {
      hasInitializedViewerPosition.current = false
    }
  }, [activeIndex])
    
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
          <button
            className="fp-tile"
            key={item._id || idx}
            type="button"
            onClick={() => {
              setStartIndex(idx)
              setActiveIndex(idx)
            }}
          >
            <video src={item.video} muted />
          </button>
        ))}
      </section>

      {activeIndex !== null && videos[activeIndex] && (
        <div className="fp-viewer">
          <button className="fp-viewer-close" type="button" onClick={() => setActiveIndex(null)}>
            Close
          </button>
          <div
            className="fp-viewer-scroll"
            onScroll={(e) => {
              const viewportHeight = e.currentTarget.clientHeight || 1
              const raw = Math.round(e.currentTarget.scrollTop / viewportHeight)
              const next = Math.max(0, Math.min(videos.length - 1, raw))
              if (next !== activeIndex) setActiveIndex(next)
            }}
            ref={viewerRef}
          >
            {videos.map((item, idx) => (
              <div className="fp-viewer-slide" key={item._id || idx}>
                <video
                  src={item?.video}
                  className="fp-viewer-video"
                  controls={false}
                  autoPlay
                  loop
                  muted
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
