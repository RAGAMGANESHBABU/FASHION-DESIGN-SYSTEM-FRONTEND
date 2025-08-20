import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './Navbar';
import LoadingSpinner from './LoadingSpinner'; // ✅ Global loader
import './Profile.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      const id = parsedUser._id;

      axios
        .get(`${BASE_URL}/users/profile/${id}`)
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
  }, []);

  if (loading) return <LoadingSpinner />; // ✅ Global animation while loading
  if (!profile) return <p>User not found.</p>;

  return (
    <div className="profile-container">
      <NavBar />
      <h2>Welcome, {profile.name}</h2>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.isAdmin ? 'Admin' : 'User'}</p>
    </div>
  );
};

export default Profile;
