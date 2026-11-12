import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/Student/Profile.css"
import { useAuth } from '../../context/AuthContext';
// import api from '../../api/axios';
// import toast from 'react-hot-toast';
// import { calcCompletion } from '../../utils/profileCompletion';
import {
    RiEditLine, RiMapPinLine, RiStarFill, RiStarLine, RiLinkedinBoxLine,
    RiGithubLine, RiGlobalLine, RiShieldCheckLine, RiUserLine, RiFireLine,
    RiBookOpenLine, RiLightbulbLine, RiAwardLine, RiCheckboxCircleLine,
    RiTwitterLine, RiRefreshLine,
} from 'react-icons/ri';

/* ─── StarRating ────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => (
    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i =>
            i <= Math.round(rating)
                ? <RiStarFill key={i} size={15} color="#fbbf24" />
                : <RiStarLine key={i} size={15} color="#475569" />,
        )}
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '0.25rem' }}>
            {rating?.toFixed?.(1) || '0.0'}
        </span>
    </div>
);

/* ─── Badge info map ────────────────────────────────────────────────────── */
const badgeMap = {
    newcomer: { icon: '🌱', color: '#34d399' },
    expert: { icon: '💎', color: '#fbbf24' },
    top_mentor: { icon: '⭐', color: '#f59e0b' },
    premium: { icon: '👑', color: '#8b5cf6' },
    admin: { icon: '🛡️', color: '#ef4444' },
    verified: { icon: '✅', color: '#22d3ee' },
    streak_7: { icon: '🔥', color: '#f97316' },
    streak_30: { icon: '💫', color: '#a855f7' },
    first_session: { icon: '🎯', color: '#06b6d4' },
    first_review: { icon: '📝', color: '#ec4899' },
};

/* ─── Profile Page ──────────────────────────────────────────────────────── */
// sample
const Profile = () => {
    //   const { user: ctxUser, updateUser } = useAuth();
    const { user, loading } = useAuth();

    const [profile, setProfile] = useState(user);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const response = await fetch("https://skillssync-a4r9.onrender.com/api/auth/profile", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (response.ok) {
                    setProfile(data.user);
                    console.log("FRESH PROFILE DATA:", data.user);
                } else {
                    console.error("PROFILE FETCH ERROR:", data);
                }
            } catch (error) {
                console.error("PROFILE FETCH ERROR:", error);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '1rem',
                }}
            >
                Loading profile...
            </div>
        );
    }

    if (!user) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                }}
            >
                Please login to view your profile.
            </div>
        );
    }

    if (!profile) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                }}
            >
                Loading profile...
            </div>
        );
    }

    /* ── Derived data ── */
    // const completion = calcCompletion(profile);
    const completion = profile?.completionPercentage || 0;
    const skills_offered = profile?.skills_offered || [];
    const skills_wanted = profile?.skills_wanted || [];
    const badges = profile?.badges || [];
    const social = profile?.socialLinks || {};

    const completionColor = completion < 40 ? '#f87171' : completion < 70 ? '#fbbf24' : '#34d399';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in profile-page">

            {/* ── Hero Card ── */}
            <div className="glass-card profile-hero" style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
                border: '1px solid rgba(139,92,246,0.25)',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', right: '-30px', top: '-30px', fontSize: '10rem', opacity: 0.03, pointerEvents: 'none' }}>👤</div>

                <div  className="profile-hero-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.75rem', flexWrap: 'wrap' }}>

                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {profile.profilePicture ? (
                            <img
                                src={`https://skillssync-a4r9.onrender.com${profile.profilePicture}`}
                                alt={profile.name}
                                className="avatar"
                                style={{
                                    width: 100,
                                    height: 100,
                                    fontSize: '2.5rem',
                                    border: '3px solid rgba(139,92,246,0.4)',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div
                                className="avatar"
                                style={{
                                    width: 100,
                                    height: 100,
                                    fontSize: '2.5rem',
                                    border: '3px solid rgba(139,92,246,0.4)',
                                }}
                            >
                                {profile.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}

                        {profile.isVerified && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    background: '#06b6d4',
                                    borderRadius: '50%',
                                    padding: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #0a0a0f',
                                }}
                            >
                                <RiShieldCheckLine size={13} color="white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div  className="profile-info" style={{ flex: 1, minWidth: 200 }}>
                        <div className="profile-info-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {profile.name}
                            </h1>
                            <span className={`badge ${profile.role === 'mentor' ? 'badge-cyan' : 'badge-primary'}`}>
                                {profile.role === 'mentor' ? '🎓 Mentor' : '📚 Student'}
                            </span>
                            {profile.isVerified && (
                                <span className="badge badge-green">
                                    <RiShieldCheckLine size={12} /> Verified
                                </span>
                            )}
                            {profile.membership === 'premium' && (
                                <span className="badge badge-yellow">👑 Premium</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                            <StarRating rating={profile.rating} />
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>· {profile.totalRatings || 0} reviews</span>
                        </div>

                        {profile.location && (
                            <div className="profile-location" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                <RiMapPinLine size={14} /> {profile.location}
                            </div>
                        )}

                        {profile.bio || profile.primarySkill ? (
                            <p className="profile-bio" style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1rem', maxWidth: 520 }}>
                                {profile.bio || `Learning ${profile.primarySkill}`}
                            </p>
                        ) : (
                            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 1rem', fontStyle: 'italic' }}>
                                No bio yet.{' '}
                                <Link to="/profile/edit" style={{ color: '#a78bfa', textDecoration: 'none' }}>Add one →</Link>
                            </p>
                        )}

                        {/* Quick stats */}
                        <div className="profile-stats" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {[
                                { val: profile.skillCoins || 0, label: 'Skill Coins', color: '#fbbf24' },
                                { val: `${profile.streakCount || 0}🔥`, label: 'Day Streak', color: '#34d399' },
                                { val: profile.totalSessions || 0, label: 'Sessions', color: '#a78bfa' },
                                { val: badges.length, label: 'Badges', color: '#06b6d4' },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.125rem' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top-right actions */}
                    <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, position: 'relative', zIndex: 10, }}>
                        <Link to="/profile/edit" className="btn-primary cursor-pointer" style={{
                            padding: '0.5rem 1.25rem', fontSize: '0.875rem', position: "relative",
                            zIndex: 9999
                        }}>
                            <RiEditLine /> Edit Profile
                        </Link>
                        <button
                            onClick={async () => {
                                setRefreshing(true);

                                try {
                                    const response = await fetch("https://skillssync-a4r9.onrender.com/api/auth/profile", {
                                        method: "GET",
                                        credentials: "include",
                                    });

                                    const data = await response.json();

                                    if (response.ok) {
                                        setProfile(data.user);
                                        console.log("PROFILE REFRESHED:", data.user);
                                    }
                                } catch (error) {
                                    console.error("REFRESH ERROR:", error);
                                } finally {
                                    setRefreshing(false);
                                }
                            }}
                            disabled={refreshing}
                            className="btn-ghost"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', justifyContent: 'center', opacity: refreshing ? 0.6 : 1 }}
                        >
                            <RiRefreshLine style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                            {refreshing ? 'Syncing…' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* ── Profile Completion ── */}
                <div  className="profile-completion" style={{
                    marginTop: '1.75rem', padding: '1.25rem',
                    background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <RiCheckboxCircleLine /> Profile Completion
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: completionColor }}>{completion}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${completion}%`, background: `linear-gradient(90deg, ${completionColor}, ${completionColor}aa)` }} />
                    </div>
                    {completion < 100 && (
                        <Link to="/profile/edit"
                            style={{ fontSize: '0.75rem', color: '#06b6d4', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>
                            Complete your profile to improve discoverability →
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Skills Row ── */}
            <div className="profile-skills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="card">
                    <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RiLightbulbLine color="#fbbf24" /> Skills I Can Teach
                    </h3>
                    {skills_offered.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {skills_offered.map((s, i) => <span key={i} className="badge badge-yellow">{s}</span>)}
                        </div>
                    ) : (
                        <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                            No skills added.{' '}
                            <Link to="/profile/edit" style={{ color: '#a78bfa', textDecoration: 'none' }}>Add some →</Link>
                        </p>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RiBookOpenLine color="#06b6d4" /> Skills I Want to Learn
                    </h3>
                    {skills_wanted.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {skills_wanted.map((s, i) => <span key={i} className="badge badge-cyan">{s}</span>)}
                        </div>
                    ) : (
                        <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                            No skills added.{' '}
                            <Link to="/profile/edit" style={{ color: '#a78bfa', textDecoration: 'none' }}>Add some →</Link>
                        </p>
                    )}
                </div>
            </div>

            {/* ── Badges & Info ── */}
            <div className="profile-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                {/* Badges */}
                <div className="card">
                    <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RiAwardLine color="#a78bfa" /> Achievements & Badges
                    </h3>
                    {badges.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                            {badges.map((badge, i) => {
                                const info = badgeMap[badge] || { icon: '🏅', color: '#94a3b8' };
                                return (
                                    <div key={i} style={{
                                        padding: '1rem 0.75rem', textAlign: 'center',
                                        background: `${info.color}10`, border: `1px solid ${info.color}25`,
                                        borderRadius: '0.875rem', transition: 'all 0.2s', cursor: 'default',
                                    }}
                                        onMouseOver={e => { e.currentTarget.style.background = `${info.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = `${info.color}10`; e.currentTarget.style.transform = 'none'; }}>
                                        <div style={{ fontSize: '1.875rem', marginBottom: '0.375rem' }}>{info.icon}</div>
                                        <div style={{ fontSize: '0.7rem', color: info.color, fontWeight: 600, textTransform: 'capitalize' }}> {badge.split('_').join(' ')}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                No badges yet. Complete sessions and tests to earn them!
                            </p>
                        </div>
                    )}
                </div>

                {/* Social + About */}
                <div className="profile-bottom-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Social Links */}
                    <div className="card about-card">
                        <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RiGlobalLine color="#06b6d4" /> Social Links
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {[
                                { key: 'linkedin', icon: <RiLinkedinBoxLine size={17} />, color: '#0ea5e9', label: 'LinkedIn' },
                                { key: 'github', icon: <RiGithubLine size={17} />, color: '#e2e8f0', label: 'GitHub' },
                                { key: 'portfolio', icon: <RiGlobalLine size={17} />, color: '#a78bfa', label: 'Portfolio' },
                                { key: 'twitter', icon: <RiTwitterLine size={17} />, color: '#22d3ee', label: 'Twitter / X' },
                            ].map(({ key, icon, color, label }) =>
                                social[key] ? (
                                    <a key={key} href={social[key]} target="_blank" rel="noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                                            color, textDecoration: 'none', fontSize: '0.85rem',
                                            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                            background: `${color}10`, transition: 'background 0.2s',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = `${color}20`; }}
                                        onMouseOut={e => { e.currentTarget.style.background = `${color}10`; }}>
                                        {icon} {label}
                                    </a>
                                ) : null,
                            )}
                            {!social.linkedin && !social.github && !social.portfolio && !social.twitter && (
                                <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                                    No links added.{' '}
                                    <Link to="/profile/edit" style={{ color: '#a78bfa', textDecoration: 'none' }}>Add them →</Link>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* About */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RiUserLine color="#34d399" /> About
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {[
                                { label: 'Experience', value: profile.experienceLevel || 'Not set' },
                                { label: 'Availability', value: profile.availability || 'Not set' },
                                { label: 'Member Since', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#94a3b8' }}>{label}</span>
                                    <span style={{ color: '#e2e8f0', fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Profile;

