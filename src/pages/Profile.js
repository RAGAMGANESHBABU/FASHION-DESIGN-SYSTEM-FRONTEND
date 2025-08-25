import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './Navbar';
import LoadingSpinner from './LoadingSpinner'; 
import './Profile.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      let parsedUser = null;
      try {
        parsedUser = JSON.parse(user);
      } catch (err) {
        console.error("Invalid user object in localStorage");
      }

      if (parsedUser?._id) {
        axios
          .get(`${BASE_URL}/users/profile/${parsedUser._id}`)
          .then((res) => {
            setProfile(res.data);
          })
          .catch((err) => {
            console.error('Failed to fetch profile:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p>User not found.</p>;

  return (
    <div className="profile-wrapper">
      <NavBar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>Welcome, {profile?.name || "Guest"}</h2>
          <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
          <p><strong>Role:</strong> {profile?.isAdmin ? 'Admin' : 'User'}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
