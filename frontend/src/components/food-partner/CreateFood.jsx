import React, { useRef, useState, useMemo } from 'react'
import '../../styles/theme.css'
import '../../styles/createFood.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

const CreateFood = () => {

  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)


  const onFilechange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) {
      setVideoFile(null)
      setFileError('')
      return
    }

    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file')
      return
    }
    setFileError('')
    setVideoFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file')
      return
    }
    setFileError('')
    setVideoFile(file)

  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const openFileDialog = () => fileInputRef.current?.click()

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile || !name.trim()) {
      setFileError('Please add a name and a valid video file')
      return
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', description.trim())
    formData.append('video', videoFile)

    try {
      setIsSubmitting(true)
      const response = await axios.post(`${API_BASE_URL}/api/food`, formData, {
        withCredentials: true
        
      })
      navigate('/')
      console.log('Create food success:', response.data)
      setFileError('')
    } catch (err) {
      console.log('Create food error:', err.response?.data || err.message)
      setFileError(err.response?.data?.message || 'Upload failed, please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = useMemo(() => !name.trim() || !videoFile || isSubmitting, [name, videoFile, isSubmitting])

  return (
    <div className="cf-page">
      <section className="cf-card">
        <header className="cf-header">
          <div className="cf-title">Create food</div>
          <div className="cf-subtitle">add a new food reel with details</div>
        </header>

        <div className="cf-field" onDrop={onDrop} onDragOver={onDragOver} onClick={openFileDialog}>
          <label className="cf-label" htmlFor="food-video">
            <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="12" height="14" rx="3" />
              <path d="M15 9l6-3v12l-6-3" />
            </svg>
            video
          </label>
          <input
            id="food-video"
            ref={fileInputRef}
            className="cf-file"
            type="file"
            accept="video/*"
            onChange={onFilechange}
          />
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {fileError && <p className="cf-error">{fileError}</p>}

        <div className="cf-actions">
          <button className="cf-button" type="button" onClick={onSubmit} disabled={isDisabled}>
            {isSubmitting ? 'Publishing...' : 'Publish food'}
          </button>
        </div>
      </section>

    </div>
  )
}

export default CreateFood
