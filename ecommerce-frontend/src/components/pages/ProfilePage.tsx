import React, { useEffect, useState } from "react";
import { getProfile } from "../../api/users";

interface UserProfile {
  id: string;
  username: string;
  role: string;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700&display=swap');

  .profile-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    padding: 2rem;
    background-image: radial-gradient(circle at 20% 50%, rgba(255, 220, 100, 0.04) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 150, 80, 0.04) 0%, transparent 50%);
  }

  .profile-card {
    width: 100%;
    max-width: 480px;
    border: 1px solid #222;
    background: #111;
    padding: 0;
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .profile-header {
    padding: 2rem 2.5rem 1.5rem;
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .profile-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0;
  }

  .profile-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f5c842;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.75); }
  }

  .profile-body {
    padding: 0.5rem 0;
  }

  .profile-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    align-items: baseline;
    padding: 1.1rem 2.5rem;
    border-bottom: 1px solid #1a1a1a;
    transition: background 0.15s;
  }

  .profile-row:last-child {
    border-bottom: none;
  }

  .profile-row:hover {
    background: rgba(255,255,255,0.02);
  }

  .profile-label {
    font-size: 0.65rem;
    font-weight: 500;
    color: #555;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .profile-value {
    font-size: 0.9rem;
    color: #e8e8e8;
    font-weight: 300;
    word-break: break-all;
  }

  .profile-value.id {
    font-size: 0.75rem;
    color: #666;
    letter-spacing: 0.05em;
  }

  .profile-value.username {
    color: #fff;
    font-weight: 500;
  }

  .role-badge {
    display: inline-block;
    padding: 0.2em 0.7em;
    background: rgba(245, 200, 66, 0.1);
    border: 1px solid rgba(245, 200, 66, 0.25);
    color: #f5c842;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Loading state */
  .profile-status {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    color: #444;
    letter-spacing: 0.1em;
  }

  .profile-status span {
    animation: blink 1.2s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
`;

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading)
    return (
      <>
        <style>{styles}</style>
        <div className="profile-status">
          LOADING<span>_</span>
        </div>
      </>
    );

  if (!profile)
    return (
      <>
        <style>{styles}</style>
        <div className="profile-status">PROFILE NOT FOUND</div>
      </>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="profile-root">
        <div className="profile-card">
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <div className="profile-dot" />
          </div>
          <div className="profile-body">
            <div className="profile-row">
              <span className="profile-label">User ID</span>
              <span className="profile-value id">{profile.id}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Username</span>
              <span className="profile-value username">{profile.username}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role</span>
              <span className="profile-value">
                <span className="role-badge">{profile.role.replace("ROLE_", "")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}