import React from 'react';
import "../../styles/shared.css";
import '../../styles/theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () =>{
  
  const navigate = useNavigate()
  const handleSubmit = async(e) =>{
    e.preventDefault();
  

    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post('http://localhost:3000/api/auth/user/login', {
      email,
      password 
    }, {withCredentials:true})
  
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