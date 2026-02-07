import React from 'react';
import "../../styles/shared.css";
import '../../styles/theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserRegister = () => {

  const navigate = useNavigate()

  const handleSubmit = async (e)=>{
    e.preventDefault()
  
    const fullName = e.target.fullName.value
    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post('http://localhost:3000/api/auth/user/register',{
      fullName,
      email,
      password
    }, {withCredentials:true})
    console.log(response.data)
    navigate("/")
  }

  return (
    <div className="form-container">
      <h1>User sign up</h1>
      <p>Create your account to get started.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Username</label>
          <input type="text" id="fullName" name="fullName" placeholder="Your name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Create password" required />
        </div>
        <button type="submit" >Create Account</button>
      </form>
      <div className="form-footer"  >
        Already have an account? <a href="/user/login">Sign in</a>
      </div>
    </div>
  );
}


export default UserRegister;