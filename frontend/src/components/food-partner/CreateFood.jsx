import React, { useEffect, useRef, useState, useMemo} from 'react'
import '../../styles/theme.css'
import '../../styles/createFood.css'
import axios  from 'axios'

const CreateFood = () => {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoURl, setvideoURl] = useState('')
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(()=>{
    if (!videoFile){
      setvideoURl('')
      return;
    }

    const url = URL.createObjectURL(videoFile)
    setvideoURl(url)

    return ()=> URL.revokeObjectURL(url)
  },[videoFile])


  const onFilechange = (e)=>{
    const file = e.target.files && e.target.files[0]
  }

  return (
    <div className="cf-page">
      <section className="cf-card">
        <header className="cf-header">
          <div className="cf-title">Create food</div>
          <div className="cf-subtitle">add a new food reel with details</div>
        </header>

        <div className="cf-field">
          <label className="cf-label" htmlFor="food-video">
            <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="12" height="14" rx="3" />
              <path d="M15 9l6-3v12l-6-3" />
            </svg>
            video
          </label>
          <input id="food-video" className="cf-file" type="file" accept="video/*" />
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="food-name">
            <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M5 7h14" />
              <path d="M5 17h10" />
            </svg>
            name
          </label>
          <input
            id="food-name"
            className="cf-input"
            type="text"
            placeholder="e.g. masala dosa"
          />
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="food-description">
            <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4h10a2 2 0 0 1 2 2v12l-3-3H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            </svg>
            description
          </label>
          <textarea
            id="food-description"
            className="cf-textarea"
            placeholder="describe your food..."
          />
        </div>

        <div className="cf-actions">
          <button className="cf-button" type="button">
            Publish food
          </button>
        </div>
      </section>

    </div>
  )
}

export default CreateFood
