import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Mentor/Profile.css";

import {
  RiUserLine,
  RiEditLine,
  RiRefreshLine,
  RiMapPinLine,
  RiStarFill,
  RiLightbulbLine,
  RiBookOpenLine,
  RiTrophyLine,
  RiLinkedinBoxLine,
  RiGithubLine,
  RiGlobalLine,
  RiTwitterLine,
  RiShieldCheckLine,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

const API = "https://skillssync-a4r9.onrender.com";

const MentorProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser, loading } = useAuth();

  /* ── Derived values from real user ── */
  const displayName   = user?.name          || "Mentor";
  const bio           = user?.bio           || "Add a bio to let students know about you.";
  const location      = user?.location      || "";
  const experience    = user?.experienceLevel || "beginner";
  const availability  = user?.availability  || "flexible";
  const skillsTeach   = user?.skills_offered || [];
  const skillsLearn   = user?.skills_wanted  || [];
  const completion    = user?.completionPercentage || 0;
  const rating        = user?.rating        || 0;
  const totalRatings  = user?.totalRatings  || 0;
  const memberSince   = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const socialLinks   = user?.socialLinks   || {};

  /* ── Avatar — could be a server path or empty ── */
  const getAvatarSrc = (pic) => {
    if (!pic) return null;
    if (pic.startsWith("http") || pic.startsWith("data:")) return pic;
    return `${API}${pic}`;
  };
  const avatarSrc = getAvatarSrc(user?.profilePicture);

  /* ── Experience label ── */
  const expLabels = {
    beginner:     "Beginner",
    intermediate: "Intermediate",
    advanced:     "Advanced",
    expert:       "Expert",
  };

  /* ── Availability label ── */
  const availLabels = {
    weekdays: "Weekdays",
    weekends: "Weekends",
    both:     "Weekdays & Weekends",
    flexible: "Flexible",
  };

  const renderStars = (r) =>
    Array.from({ length: 5 }, (_, i) => (
      <RiStarFill key={i} style={{ color: i < Math.floor(r) ? "#fbbf24" : "rgba(255,255,255,0.15)" }} />
    ));

  /* ── Social links list — only show filled ones ── */
  const socialItems = [
    { icon: <RiLinkedinBoxLine />, label: "LinkedIn",        url: socialLinks.linkedin  },
    { icon: <RiGithubLine />,      label: "GitHub",          url: socialLinks.github    },
    { icon: <RiGlobalLine />,      label: "Portfolio",       url: socialLinks.portfolio },
    { icon: <RiTwitterLine />,     label: "Twitter / X",     url: socialLinks.twitter   },
  ].filter((s) => !!s.url);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0", color: "#94a3b8" }}>
        <RiLoader4Line style={{ fontSize: "2rem", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="mentor-profile-page">

      {/* ── BANNER CARD ── */}
      <div className="profile-banner-card">
        <div className="profile-banner-bg" />

        <div className="profile-banner-content">

          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            {user?.isVerified && (
              <div className="profile-verified-badge">
                <RiCheckLine />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="profile-banner-info">

            <div className="profile-name-row">
              <h1>{displayName}</h1>
              <span className="profile-badge badge-mentor">🔥 Mentor</span>
              {user?.isVerified && (
                <span className="profile-badge badge-verified">✓ Verified</span>
              )}
              {user?.membership === "premium" && (
                <span className="profile-badge badge-premium">👑 Premium</span>
              )}
            </div>

            {totalRatings > 0 && (
              <div className="profile-rating-row">
                <div className="profile-stars">{renderStars(rating)}</div>
                <span className="profile-rating-val">{rating.toFixed(1)}</span>
                <span className="profile-rating-count">· {totalRatings} reviews</span>
              </div>
            )}

            {location && (
              <div className="profile-location">
                <RiMapPinLine />
                <span>{location}</span>
              </div>
            )}

            <p className="profile-bio">{bio}</p>

            <div className="profile-banner-stats">
              <div className="profile-banner-stat">
                <span className="profile-banner-stat-val">{user?.skillCoins ?? 0}</span>
                <span className="profile-banner-stat-label">Skill Coins</span>
              </div>
              <div className="profile-banner-stat">
                <span className="profile-banner-stat-val">{user?.streakCount ?? 0}🔥</span>
                <span className="profile-banner-stat-label">Day Streak</span>
              </div>
              <div className="profile-banner-stat">
                <span className="profile-banner-stat-val">{user?.badges?.length ?? 0}</span>
                <span className="profile-banner-stat-label">Badges</span>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="profile-banner-actions">
            <button className="edit-profile-btn" onClick={() => navigate("/mentor/profile/edit")}>
              <RiEditLine />
              Edit Profile
            </button>
            <button className="refresh-btn" type="button" onClick={refreshUser}>
              <RiRefreshLine />
              Refresh
            </button>
          </div>

        </div>
      </div>

      {/* ── COMPLETION BAR ── */}
      <div className="profile-completion-card">
        <div className="completion-header">
          <div className="completion-title">
            <RiShieldCheckLine />
            Profile Completion
          </div>
          <span className="completion-pct">{completion}%</span>
        </div>
        <div className="completion-bar-track">
          <div className="completion-bar-fill" style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && (
          <p className="completion-hint" onClick={() => navigate("/mentor/profile/edit")}>
            Complete your profile to improve discoverability →
          </p>
        )}
      </div>

      {/* ── TWO COLUMNS ── */}
      <div className="profile-two-col">

        {/* LEFT — Skills + Achievements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Skills I Can Teach */}
          <div className="profile-card">
            <div className="profile-card-header">
              <RiLightbulbLine />
              Skills I Can Teach
            </div>
            {skillsTeach.length > 0 ? (
              <div className="skill-tags">
                {skillsTeach.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                No skills added yet.{" "}
                <span
                  style={{ color: "#8b5cf6", cursor: "pointer" }}
                  onClick={() => navigate("/mentor/profile/edit")}
                >
                  Add skills →
                </span>
              </p>
            )}
          </div>

          {/* Skills I Want to Learn */}
          <div className="profile-card">
            <div className="profile-card-header">
              <RiBookOpenLine />
              Skills I Want to Learn
            </div>
            {skillsLearn.length > 0 ? (
              <div className="skill-tags">
                {skillsLearn.map((s) => <span key={s} className="skill-tag skill-tag-learn">{s}</span>)}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                No skills added yet.{" "}
                <span
                  style={{ color: "#8b5cf6", cursor: "pointer" }}
                  onClick={() => navigate("/mentor/profile/edit")}
                >
                  Add skills →
                </span>
              </p>
            )}
          </div>

          {/* Achievements */}
          {user?.badges?.length > 0 && (
            <div className="profile-card">
              <div className="profile-card-header">
                <RiTrophyLine />
                Achievements &amp; Badges
              </div>
              <div className="achievements-grid">
                {user.badges.map((b) => (
                  <div key={b} className="achievement-badge">
                    <span className="badge-icon">🏅</span>
                    <span className="badge-label">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT — Social + About */}
        <div className="profile-right-col">

          {/* Social Links */}
          {socialItems.length > 0 && (
            <div className="profile-card">
              <div className="profile-card-header">
                <RiGlobalLine />
                Social Links
              </div>
              {socialItems.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link-item"
                  style={{ textDecoration: "none" }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* About */}
          <div className="profile-card">
            <div className="profile-card-header">
              <RiUserLine />
              About
            </div>
            <div className="about-rows">
              <div className="about-row">
                <span className="about-row-label">Experience</span>
                <span className="about-row-val">{expLabels[experience] || experience}</span>
              </div>
              <div className="about-row">
                <span className="about-row-label">Availability</span>
                <span className="about-row-val">{availLabels[availability] || availability}</span>
              </div>
              <div className="about-row">
                <span className="about-row-label">Rating</span>
                <span className="about-row-val">
                  {rating > 0 ? `${rating.toFixed(1)} ⭐` : "No ratings yet"}
                </span>
              </div>
              <div className="about-row">
                <span className="about-row-label">Member Since</span>
                <span className="about-row-val">{memberSince}</span>
              </div>
              <div className="about-row">
                <span className="about-row-label">Role</span>
                <span className="about-row-val" style={{ textTransform: "capitalize" }}>
                  {user?.role || "Mentor"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MentorProfile;

