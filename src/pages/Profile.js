import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './Navbar';
import './Profile.css'; // 👈 Import CSS file

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      const id = parsedUser._id;

      axios
        .get(`http://localhost:5000/api/users/profile/${id}`)
        .then((res) => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;
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
