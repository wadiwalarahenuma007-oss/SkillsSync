import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Mentor/EditProfile.css";

import {
  RiArrowLeftLine,
  RiSaveLine,
  RiUserLine,
  RiLightbulbLine,
  RiGlobalLine,
  RiLinkedinBoxLine,
  RiGithubLine,
  RiTwitterLine,
  RiAddLine,
  RiCloseLine,
  RiUploadLine,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

const experienceLevels = [
  { value: "beginner",     label: "Beginner",     icon: "🌱", sub: "<1 yr"  },
  { value: "intermediate", label: "Intermediate", icon: "📘", sub: "1–3 yrs" },
  { value: "advanced",     label: "Advanced",     icon: "🚀", sub: "4–6 yrs" },
  { value: "expert",       label: "Expert",       icon: "💎", sub: "7+ yrs"  },
];

const API = "https://skillssync-a4r9.onrender.com";

const MentorEditProfile = () => {
  const navigate  = useNavigate();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  /* ── Derived avatar URL (server path → full URL) ── */
  const getAvatarSrc = (pic) => {
    if (!pic) return null;
    if (pic.startsWith("http") || pic.startsWith("data:")) return pic;
    return `${API}${pic}`;
  };

  /* ── Local form state (pre-filled from user object) ── */
  const [form, setForm] = useState({
    fullName:     user?.name             || "",
    bio:          user?.bio              || "",
    location:     user?.location         || "",
    availability: user?.availability     || "weekends",
    experience:   user?.experienceLevel  || "beginner",
    linkedin:     user?.socialLinks?.linkedin   || "",
    github:       user?.socialLinks?.github     || "",
    portfolio:    user?.socialLinks?.portfolio  || "",
    twitter:      user?.socialLinks?.twitter    || "",
  });

  const [skillsTeach, setSkillsTeach] = useState(user?.skills_offered || []);
  const [skillTeachInput, setSkillTeachInput] = useState("");
  const [skillsLearn, setSkillsLearn] = useState(user?.skills_wanted || []);
  const [skillLearnInput, setSkillLearnInput] = useState("");

  /* ── Photo state ── */
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(getAvatarSrc(user?.profilePicture));

  /* ── UI state ── */
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Photo picker ── */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Skills helpers ── */
  const addTeachSkill = () => {
    const v = skillTeachInput.trim();
    if (v && !skillsTeach.includes(v) && skillsTeach.length < 10) {
      setSkillsTeach((p) => [...p, v]);
      setSkillTeachInput("");
    }
  };
  const removeTeachSkill = (s) => setSkillsTeach((p) => p.filter((x) => x !== s));

  const addLearnSkill = () => {
    const v = skillLearnInput.trim();
    if (v && !skillsLearn.includes(v) && skillsLearn.length < 10) {
      setSkillsLearn((p) => [...p, v]);
      setSkillLearnInput("");
    }
  };
  const removeLearnSkill = (s) => setSkillsLearn((p) => p.filter((x) => x !== s));

  /* ── SAVE ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const fd = new FormData();
      fd.append("name",            form.fullName);
      fd.append("bio",             form.bio);
      fd.append("location",        form.location);
      fd.append("availability",    form.availability);
      fd.append("experienceLevel", form.experience);
      fd.append("skills_offered",  JSON.stringify(skillsTeach));
      fd.append("skills_wanted",   JSON.stringify(skillsLearn));
      fd.append("socialLinks", JSON.stringify({
        linkedin:  form.linkedin,
        github:    form.github,
        portfolio: form.portfolio,
        twitter:   form.twitter,
      }));
      if (photoFile) {
        fd.append("profilePicture", photoFile);
      }

      const res = await fetch(`${API}/api/auth/profile`, {
        method:      "PUT",
        credentials: "include",
        body:        fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      /* ── Update AuthContext so sidebar & profile page reflect changes immediately ── */
      setUser(data.user);
      setSuccess(true);

      setTimeout(() => navigate("/mentor/profile"), 800);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Completion percentage from user object (updated after save) ── */
  const completionPct = user?.completionPercentage || 0;

  const completionItems = [
    { label: "Full Name (+10%)",       done: !!form.fullName },
    { label: "Bio (+15%)",             done: !!form.bio },
    { label: "Location (+10%)",        done: !!form.location },
    { label: "Profile Photo (+15%)",   done: !!photoPreview },
    { label: "Skills I Teach (+10%)",  done: skillsTeach.length > 0 },
    { label: "Skills to Learn (+10%)", done: skillsLearn.length > 0 },
    { label: "Experience Level (+12%)",done: !!form.experience },
    { label: "Social Link (+10%)",     done: !!(form.linkedin || form.github || form.portfolio || form.twitter) },
    { label: "Availability (+8%)",     done: !!form.availability },
  ];

  return (
    <form className="mentor-edit-profile-page" onSubmit={handleSave}>

      {/* ── TOP BAR ── */}
      <div className="edit-profile-topbar">
        <div className="edit-profile-topbar-left">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/mentor/profile")}
          >
            <RiArrowLeftLine />
          </button>
          <div>
            <h1>Edit Profile</h1>
            <p>Update your information — changes save instantly</p>
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? <RiLoader4Line className="spin-icon" /> : <RiSaveLine />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ── SAVE FEEDBACK ── */}
      {success && (
        <div className="edit-save-success">
          <RiCheckLine /> Profile saved successfully! Redirecting…
        </div>
      )}
      {error && (
        <div className="edit-save-error">
          ⚠ {error}
        </div>
      )}

      {/* ── COMPLETION BANNER ── */}
      <div className="edit-completion-card">
        <div className="edit-completion-header">
          <div className="edit-completion-title">
            <RiCheckLine />
            Profile Completion
          </div>
          <span className="edit-completion-pct" style={{ color: "#34d399" }}>
            {completionPct}%
          </span>
        </div>
        <div className="edit-completion-bar-track">
          <div className="edit-completion-bar-fill" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="edit-completion-hints">
          {completionItems.map((item) => (
            <div key={item.label} className="completion-hint-item">
              <RiCheckLine style={{ color: item.done ? "#10b981" : "#4b5563" }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROFILE PHOTO ── */}
      <div className="edit-section-card">
        <div className="edit-section-header">
          <RiUserLine />
          Profile Photo
        </div>
        <div className="photo-section-body">
          {/* Avatar preview */}
          <div className="edit-avatar">
            {photoPreview ? (
              <img src={photoPreview} alt="avatar" />
            ) : (
              (user?.name || "M").charAt(0).toUpperCase()
            )}
          </div>
          <div className="photo-section-info">
            <p>Upload a clear face photo. JPG, PNG or WEBP, max 5MB.</p>
            <span>A photo adds +15% to your profile completion.</span>
            <br />
            <button
              type="button"
              className="upload-photo-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <RiUploadLine />
              {photoFile ? "Change Photo" : "Upload Photo"}
            </button>
            {photoFile && (
              <span style={{ fontSize: "0.78rem", color: "#34d399", marginLeft: 8 }}>
                ✓ {photoFile.name}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>
        </div>
      </div>

      {/* ── BASIC INFORMATION ── */}
      <div className="edit-section-card">
        <div className="edit-section-header">
          <RiUserLine />
          Basic Information
        </div>
        <div className="form-grid-2">

          <div className="form-field full-width">
            <label>Full Name <span className="required">*</span></label>
            <input className="form-input" name="fullName" value={form.fullName}
              onChange={handleChange} placeholder="Your full name" required />
          </div>

          <div className="form-field full-width">
            <label>Bio</label>
            <textarea className="form-input" name="bio" value={form.bio}
              onChange={handleChange} placeholder="Tell students about yourself..."
              maxLength={500} rows={4} />
            <div className="textarea-counter">{form.bio.length}/500</div>
          </div>

          <div className="form-field">
            <label>Location</label>
            <input className="form-input" name="location" value={form.location}
              onChange={handleChange} placeholder="City, Country" />
          </div>

          <div className="form-field">
            <label>Availability</label>
            <select className="form-input" name="availability" value={form.availability}
              onChange={handleChange}>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
              <option value="both">Weekdays &amp; Weekends</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="form-field full-width">
            <label>Experience Level</label>
            <div className="exp-grid">
              {experienceLevels.map((lvl) => (
                <button key={lvl.value} type="button"
                  className={`exp-option${form.experience === lvl.value ? " active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, experience: lvl.value }))}>
                  <span className="exp-icon">{lvl.icon}</span>
                  <span>{lvl.label}</span>
                  <span className="exp-sub">{lvl.sub}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── SKILLS ── */}
      <div className="edit-section-card">
        <div className="edit-section-header">
          <RiLightbulbLine />
          Skills
        </div>

        {/* Teach */}
        <div className="skills-subsection" style={{ marginBottom: 28 }}>
          <div className="skills-subsection-header">
            <span>💡 Skills I Can Teach</span>
            <span className="skills-subsection-hint">Adds +5% completion</span>
          </div>
          <div className="skill-tags-display">
            {skillsTeach.map((s) => (
              <span key={s} className="skill-input-tag">
                {s}
                <button type="button" className="remove-tag-btn" onClick={() => removeTeachSkill(s)}>
                  <RiCloseLine />
                </button>
              </span>
            ))}
          </div>
          <div className="skill-add-row">
            <input className="skill-add-input" placeholder="Type a skill & press Enter"
              value={skillTeachInput} onChange={(e) => setSkillTeachInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTeachSkill(); } }} />
            <button type="button" className="add-skill-btn" onClick={addTeachSkill}>
              <RiAddLine /> Add
            </button>
          </div>
          <div className="skill-count-hint">{skillsTeach.length}/10 skills</div>
        </div>

        {/* Learn */}
        <div className="skills-subsection">
          <div className="skills-subsection-header">
            <span>🎯 Skills I Want to Learn</span>
            <span className="skills-subsection-hint">Adds +10% completion</span>
          </div>
          <div className="skill-tags-display">
            {skillsLearn.map((s) => (
              <span key={s} className="skill-input-tag skill-input-tag-learn">
                {s}
                <button type="button" className="remove-tag-btn" onClick={() => removeLearnSkill(s)}>
                  <RiCloseLine />
                </button>
              </span>
            ))}
          </div>
          <div className="skill-add-row">
            <input className="skill-add-input" placeholder="Type a skill & press Enter"
              value={skillLearnInput} onChange={(e) => setSkillLearnInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLearnSkill(); } }} />
            <button type="button" className="add-skill-btn" onClick={addLearnSkill}>
              <RiAddLine /> Add
            </button>
          </div>
          <div className="skill-count-hint">{skillsLearn.length}/10 skills</div>
        </div>
      </div>

      {/* ── SOCIAL LINKS ── */}
      <div className="edit-section-card">
        <div className="edit-section-header">
          <RiGlobalLine />
          Social Links
          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#64748b", fontWeight: 400 }}>
            Any one adds +10% completion
          </span>
        </div>
        <div className="social-fields-grid">
          <div className="form-field social-field-item">
            <label><RiLinkedinBoxLine /> LinkedIn</label>
            <input className="form-input" name="linkedin" value={form.linkedin}
              onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
          </div>
          <div className="form-field social-field-item">
            <label><RiGithubLine /> GitHub</label>
            <input className="form-input" name="github" value={form.github}
              onChange={handleChange} placeholder="https://github.com/yourusername" />
          </div>
          <div className="form-field social-field-item">
            <label><RiGlobalLine /> Portfolio / Website</label>
            <input className="form-input" name="portfolio" value={form.portfolio}
              onChange={handleChange} placeholder="https://yoursite.com" />
          </div>
          <div className="form-field social-field-item">
            <label><RiTwitterLine /> Twitter / X</label>
            <input className="form-input" name="twitter" value={form.twitter}
              onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div className="edit-form-actions">
        <button type="button" className="cancel-btn"
          onClick={() => navigate("/mentor/profile")}>
          Cancel
        </button>
        <button type="submit" className="save-changes-btn" disabled={saving}>
          {saving ? <RiLoader4Line className="spin-icon" /> : <RiSaveLine />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

    </form>
  );
};

export default MentorEditProfile;

