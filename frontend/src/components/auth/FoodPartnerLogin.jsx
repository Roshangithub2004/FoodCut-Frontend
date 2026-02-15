import React from 'react';
import '../../styles/shared.css';
import '../../styles/theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from '../../utils/savedVideos';
import { API_BASE_URL } from '../../config/api';


const FoodPartnerLogin = () => {
  const navigate = useNavigate()
  const handleSubmit = async(e) =>{
    e.preventDefault()

    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post(`${API_BASE_URL}/api/auth/food-partner/login`, {
      email,
      password
    }, {withCredentials:true})
    setCurrentUser({
      id: response?.data?.foodPartner?._id ?? response?.data?.foodPartner?.id ?? '',
      email,
      role: 'food-partner',
    });
    
    console.log(response)
    navigate('/create-food')
    
  }

  return(
    <div className="form-container">
      <h1>Partner sign in</h1>
      <p>Login to manage your business.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="business@example.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Your password" required />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <div className="form-footer">
        New partner? <a href="/food-partner/register">Create account</a>
      </div>
    </div>
  );
}
export default FoodPartnerLogin;
