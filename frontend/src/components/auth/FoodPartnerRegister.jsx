import React from 'react';
import "../../styles/shared.css";
import '../../styles/theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodPartnerRegister = () =>{
  const navigator = useNavigate() 
  const handleSubmit = async(e)=>{
    e.preventDefault();
    const businessName = e.target.businessName.value
    const contactName = e.target.contactName.value
    const phone = e.target.phone.value
    const email = e.target.email.value
    const password = e.target.password.value

    const response = await axios.post("http://localhost:3000/api/auth/food-partner/register",{
      businessName,                   
      contactName,
      phone,
      email,
      password

    },{withCredentials:true})
    console.log(response)
    navigator('/create-food')

  }

  return (
    <div className="form-container">
      <h1>Partner sign up</h1>
      <p>Grow your business with our platform.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="businessName">Business Name</label>
          <input type="text" id="businessName" name="businessName" placeholder="Tasty Bites" required />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="contactName">Contact Name</label>
            <input type="text" id="contactName" name="contactName" placeholder="Rahul Sharma" required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="phone">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="+91 555 123 4567" required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="business@example.com" required />
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Create password" required />
          </div>
        </div>
        <button type="submit">Create Partner Account</button>
      </form>
      <div className="form-footer">
        Already a partner? <a href="/food-partner/login">Sign in</a>
      </div>
    </div>
  );
}
export default FoodPartnerRegister;