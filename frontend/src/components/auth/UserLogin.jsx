import React from 'react';
import "../../styles/shared.css";
import '../../styles/theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from '../../utils/savedVideos';
import { API_BASE_URL } from '../../config/api';

const UserLogin = () =>{
  
  const navigate = useNavigate()
  const handleSubmit = async(e) =>{
    e.preventDefault();
  

    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post(`${API_BASE_URL}/api/auth/user/login`, {
      email,
      password 
    }, {withCredentials:true})
    setCurrentUser({
      id: response?.data?.user?._id ?? response?.data?.user?.id ?? '',
      email,
      role: 'user',
    });
  
    navigate('/')
    console.log(response)

  }

  return (
    <div className="form-container">
      <h1>User sign in</h1>
      <p>Welcome back! Please login to your account.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Your password" required />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <div className="form-footer">
        New here? <a href="/user/register">Create an account</a>
      </div>
    </div>
  );
}

export default UserLogin;
