import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Student/EditProfile.css';
import {
    RiSaveLine,
    RiArrowLeftLine,
    RiAddLine,
    RiCloseLine,
    RiUpload2Line,
    RiLinkedinBoxLine,
    RiGithubLine,
    RiGlobalLine,
    RiUserLine,
    RiMapPinLine,
    RiTwitterLine,
    RiCheckboxCircleLine,
    RiErrorWarningLine,
} from 'react-icons/ri';

const completionFields = [
    { key: "name", label: "Full Name", weight: 10 },
    { key: "bio", label: "Bio", weight: 15 },
    { key: "location", label: "Location", weight: 10 },
    { key: "skills_offered", label: "Skills I Teach", weight: 15 },
    { key: "skills_wanted", label: "Skills to Learn", weight: 10 },
    { key: "experienceLevel", label: "Experience Level", weight: 10 },
    { key: "availability", label: "Availability", weight: 5 },
    { key: "profilePicture", label: "Profile Photo", weight: 15 },
    { key: "socialLinks", label: "Social Link", weight: 10 },
];

const calculateCompletion = (form, avatarPreview) => {
    let percentage = 0;

    if (form.name?.trim()) percentage += 10;
    if (form.bio?.trim()) percentage += 15;
    if (form.location?.trim()) percentage += 10;
    if (form.skills_offered?.length > 0) percentage += 15;
    if (form.skills_wanted?.length > 0) percentage += 10;
    if (form.experienceLevel) percentage += 10;
    if (form.availability) percentage += 5;

    if (avatarPreview || form.profilePicture) {
        percentage += 15;
    }

    if (
        form.socialLinks?.linkedin ||
        form.socialLinks?.github ||
        form.socialLinks?.portfolio ||
        form.socialLinks?.twitter
    ) {
        percentage += 10;
    }

    return percentage;
};

/* ───────────────── Tag Input ───────────────── */

const TagInput = ({
    tags,
    setTags,
    placeholder,
    color = '#8b5cf6',
    maxTags = 10,
}) => {
    const [input, setInput] = useState('');

    const addTag = () => {
        const value = input.trim();

        if (!value) return;
        if (tags.includes(value)) return;
        if (tags.length >= maxTags) return;

        setTags([...tags, value]);
        setInput('');
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="tag-input-wrapper">

            {/* Existing tags */}
            <div className="tag-list">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="skill-tag"
                        style={{
                            '--tag-color': color,
                            '--tag-bg': `${color}20`,
                            '--tag-border': `${color}40`,
                        }}
                    >
                        {tag}

                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="tag-remove-btn"
                        >
                            <RiCloseLine size={13} />
                        </button>
                    </span>
                ))}

                {tags.length === 0 && (
                    <span className="empty-tags">
                        No skills added yet…
                    </span>
                )}
            </div>

            {/* Input + Add */}
            <div className="tag-input-row">
                <input
                    className="input tag-input-field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder={placeholder}
                    maxLength={40}
                />

                <button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary tag-add-btn"
                >
                    <RiAddLine />
                    <span>Add</span>
                </button>
            </div>

            <p className="tag-helper-text">
                {tags.length}/{maxTags} skills · Press Enter or click Add
            </p>
        </div>
    );
};
/* ───────────────── Completion Bar ───────────────── */

const LiveCompletionBar = ({ form, avatarPreview }) => {
    const percentage = calculateCompletion(form, avatarPreview);

    const color =
        percentage < 40
            ? '#f87171'
            : percentage < 70
                ? '#fbbf24'
                : '#34d399';

    const label =
        percentage < 40
            ? 'Getting started'
            : percentage < 70
                ? 'Looking good!'
                : percentage < 100
                    ? 'Almost complete!'
                    : '🎉 Complete!';

    return (
        <div
            className="card"
            style={{
                padding: '1.25rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    }}
                >
                    <RiCheckboxCircleLine style={{ color }} />
                    Profile Completion
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.78rem',
                            color: '#94a3b8',
                        }}
                    >
                        {label}
                    </span>

                    <span
                        style={{
                            fontWeight: 800,
                            color,
                            fontSize: '1rem',
                        }}
                    >
                        {percentage}%
                    </span>
                </div>
            </div>

            <div
                style={{
                    height: 8,
                    background: 'rgba(42,42,61,0.8)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        borderRadius: '9999px',
                        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                        transition: 'width 0.4s ease',
                    }}
                />
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '0.375rem',
                    marginTop: '0.875rem',
                }}
            >
                {completionFields.map((field) => {
                    let done = false;

                    if (field.key === 'skills_offered') {
                        done = form.skills_offered?.length > 0;
                    } else if (field.key === 'skills_wanted') {
                        done = form.skills_wanted?.length > 0;
                    } else if (field.key === 'profilePicture') {
                        done = !!avatarPreview || !!form.profilePicture;
                    } else if (field.key === 'socialLinks') {
                        done =
                            !!form.socialLinks?.linkedin ||
                            !!form.socialLinks?.github ||
                            !!form.socialLinks?.portfolio ||
                            !!form.socialLinks?.twitter;
                    } else {
                        done = !!form[field.key];
                    }

                    return (
                        <div
                            key={field.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                fontSize: '0.75rem',
                            }}
                        >
                            {done ? (
                                <RiCheckboxCircleLine
                                    style={{ color: '#34d399' }}
                                />
                            ) : (
                                <RiErrorWarningLine
                                    style={{ color: '#475569' }}
                                />
                            )}

                            <span
                                style={{
                                    color: done ? '#94a3b8' : '#64748b',
                                }}
                            >
                                {field.label} (+{field.weight}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ───────────────── Info Modal (replaces all alert() calls) ───────────────── */

const InfoModal = ({ modal, onClose }) => {
    if (!modal.open) return null;

    const isSuccess = modal.type === 'success';

    const iconStyle = {
        width: 60,
        height: 60,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.75rem',
        margin: '0 auto 1.1rem',
        background: isSuccess ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${isSuccess ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.25)'}`,
    };

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.62)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                animation: 'ep-modal-fade .18s ease',
            }}
        >
            <style>{`
                @keyframes ep-modal-fade { from{opacity:0} to{opacity:1} }
                @keyframes ep-modal-slide { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--card-bg, #11182f)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    padding: '2rem',
                    width: '100%',
                    maxWidth: 360,
                    textAlign: 'center',
                    boxShadow: '0 24px 60px rgba(0,0,0,.5)',
                    animation: 'ep-modal-slide .22s ease',
                }}
            >
                {/* Icon */}
                <div style={iconStyle}>
                    {isSuccess ? '✅' : '⚠️'}
                </div>

                {/* Title */}
                <h2 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#e2e8f0',
                }}>
                    {isSuccess ? 'Profile Updated!' : 'Something went wrong'}
                </h2>

                {/* Message */}
                <p style={{
                    margin: '0 0 1.75rem',
                    fontSize: '0.88rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                }}>
                    {modal.message}
                </p>

                {/* OK button */}
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: 12,
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        color: '#fff',
                        background: isSuccess
                            ? 'linear-gradient(135deg,#34d399,#059669)'
                            : 'linear-gradient(135deg,#ef4444,#dc2626)',
                        transition: '0.18s ease',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                    OK
                </button>
            </div>
        </div>,
        document.body
    );
};

/* ───────────────── Edit Profile ───────────────── */

const EditProfile = () => {
    const navigate = useNavigate();

    const fileRef = useRef(null);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const [errors, setErrors] = useState({});
    const [modal, setModal] = useState({ open: false, type: 'success', message: '' });

    const showModal = (type, message) => setModal({ open: true, type, message });
    const closeModal = () => {
        const wasSuccess = modal.type === 'success';
        setModal((prev) => ({ ...prev, open: false }));
        if (wasSuccess) navigate('/profile');
    };

    const [form, setForm] = useState({
        name: '',
        bio: '',
        location: '',
        availability: '',
        experienceLevel: '',
        skills_offered: [],
        skills_wanted: [],
        socialLinks: {
            linkedin: '',
            github: '',
            portfolio: '',
            twitter: '',
        },
        profilePicture: '',
    });

    /* ─────────────── Load current profile ─────────────── */

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch("https://skillssync-a4r9.onrender.com/api/auth/profile", {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to load profile');
            }

            const user = data.user;

            setForm({
                name: user?.name || '',
                bio: user?.bio || '',
                location: user?.location || '',
                availability: user?.availability || '',
                experienceLevel: user?.experienceLevel || '',
                skills_offered: user?.skills_offered || [],
                skills_wanted: user?.skills_wanted || [],
                socialLinks: {
                    linkedin: user?.socialLinks?.linkedin || '',
                    github: user?.socialLinks?.github || '',
                    portfolio: user?.socialLinks?.portfolio || '',
                    twitter: user?.socialLinks?.twitter || '',
                },
                profilePicture: user?.profilePicture || '',
            });

            if (user?.profilePicture) {
                setAvatarPreview(user.profilePicture);
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────── Input changes ─────────────── */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value,
            },
        }));

        if (errors[`social_${name}`]) {
            setErrors((prev) => ({
                ...prev,
                [`social_${name}`]: '',
            }));
        }
    };

    /* ─────────────── Avatar preview ─────────────── */

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showModal('error', 'Please select a valid image file (JPG, PNG or WEBP).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showModal('error', 'Image size must be under 5 MB. Please choose a smaller photo.');
            return;
        }

        setSelectedAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    /* ─────────────── Validation ─────────────── */

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (form.bio.length > 500) {
            newErrors.bio = 'Bio must be under 500 characters';
        }

        if (form.location.length > 100) {
            newErrors.location = 'Location too long';
        }

        const urlPattern = /^https?:\/\/.+/;

        if (
            form.socialLinks.linkedin &&
            !urlPattern.test(form.socialLinks.linkedin)
        ) {
            newErrors.social_linkedin = 'Enter a valid URL';
        }

        if (
            form.socialLinks.github &&
            !urlPattern.test(form.socialLinks.github)
        ) {
            newErrors.social_github = 'Enter a valid URL';
        }

        if (
            form.socialLinks.portfolio &&
            !urlPattern.test(form.socialLinks.portfolio)
        ) {
            newErrors.social_portfolio = 'Enter a valid URL';
        }

        if (
            form.socialLinks.twitter &&
            !urlPattern.test(form.socialLinks.twitter)
        ) {
            newErrors.social_twitter = 'Enter a valid URL';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();

            formData.append("name", form.name.trim());
            formData.append("bio", form.bio.trim());
            formData.append("location", form.location.trim());
            formData.append("availability", form.availability);
            formData.append("experienceLevel", form.experienceLevel);

            formData.append(
                "skills_offered",
                JSON.stringify(form.skills_offered)
            );

            formData.append(
                "skills_wanted",
                JSON.stringify(form.skills_wanted)
            );

            formData.append(
                "socialLinks",
                JSON.stringify(form.socialLinks)
            );

            // Photo
            if (selectedAvatar) {
                formData.append("profilePicture", selectedAvatar);
            }

            console.log(
                "SENDING FORM DATA:",
                Object.fromEntries(formData.entries())
            );

            const response = await fetch("https://skillssync-a4r9.onrender.com/api/auth/profile", {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const text = await response.text();

            console.log("SERVER STATUS:", response.status);
            console.log("SERVER RESPONSE:", text);

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(
                        `Server returned    response (${response.status})`
                    );
                }
            }

            if (!response.ok) {
                throw new Error(
                    data.message || `Update failed (${response.status})`
                );
            }

            showModal('success', 'Your profile has been updated successfully! Click OK to go back to your profile.');

        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error);
            showModal('error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };
    const inputCls = (key) =>
        `input${errors[key] ? ' input-error' : ''}`;

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                Loading profile...
            </div>
        );
    }

    return (
        <>
            {/* ── Profile update / validation modal ── */}
            <InfoModal modal={modal} onClose={closeModal} />

            <div
                style={{
                    maxWidth: 740,
                    margin: '0 auto',
                }}
                className="edit-profile-page animate-fade-in"
            >

            {/* ───────── Header ───────── */}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                }}
            >
                <Link
                    to="/profile"
                    className="btn-ghost"
                    style={{
                        padding: '0.5rem',
                        flexShrink: 0,
                    }}
                >
                    <RiArrowLeftLine size={20} />
                </Link>

                <div style={{ flex: 1 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 800,
                        }}
                    >
                        Edit Profile
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                        }}
                    >
                        Update your information — changes save instantly
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={saving}
                    style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.875rem',
                    }}
                >
                    {saving ? (
                        'Saving...'
                    ) : (
                        <>
                            <RiSaveLine /> Save
                        </>
                    )}
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >

                {/* ───────── Completion ───────── */}

                <LiveCompletionBar
                    form={form}
                    avatarPreview={avatarPreview}
                />

                {/* ───────── Profile Photo ───────── */}

                <div
                    className="card"
                    style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            flexShrink: 0,
                        }}
                    >
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Profile"
                                style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border:
                                        '3px solid rgba(139,92,246,0.5)',
                                }}
                            />
                        ) : (
                            <div
                                className="avatar"
                                style={{
                                    width: 90,
                                    height: 90,
                                    fontSize: '2.25rem',
                                    border:
                                        '3px solid rgba(139,92,246,0.4)',
                                }}
                            >
                                {form.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                margin: '0 0 0.375rem',
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}
                        >
                            Profile Photo
                        </h3>

                        <p
                            style={{
                                margin: '0 0 0.875rem',
                                fontSize: '0.8rem',
                                color: '#94a3b8',
                                lineHeight: 1.5,
                            }}
                        >
                            Upload a clear face photo. JPG, PNG or WEBP,
                            max 5MB.
                            <br />
                            A photo adds{' '}
                            <strong style={{ color: '#a78bfa' }}>
                                +15%
                            </strong>{' '}
                            to your profile completion.
                        </p>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                fileRef.current?.click()
                            }
                        >
                            <RiUpload2Line />
                            {avatarPreview
                                ? 'Change Photo'
                                : 'Upload Photo'}
                        </button>
                    </div>
                </div>

                {/* ───────── Basic Info ───────── */}

                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <RiUserLine style={{ color: '#a78bfa' }} />
                        Basic Information
                    </h3>

                    <div>
                        <label className="label">
                            Full Name{' '}
                            <span style={{ color: '#f87171' }}>
                                *
                            </span>
                        </label>

                        <input
                            className={inputCls('name')}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            maxLength={80}
                        />

                        {errors.name && (
                            <p
                                style={{
                                    color: '#f87171',
                                    fontSize: '0.75rem',
                                    margin: '0.375rem 0 0',
                                }}
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="label">
                            Bio

                            <span
                                style={{
                                    float: 'right',
                                    fontSize: '0.72rem',
                                    color:
                                        form.bio.length > 450
                                            ? '#fbbf24'
                                            : '#64748b',
                                }}
                            >
                                {form.bio.length}/500
                            </span>
                        </label>

                        <textarea
                            className={inputCls('bio')}
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Tell the community about yourself, your expertise, and what you're looking for..."
                            rows={4}
                            maxLength={500}
                            style={{
                                resize: 'vertical',
                                minHeight: 100,
                                lineHeight: 1.6,
                            }}
                        />
                    </div>

                    <div className="edit-grid-2"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                        }}
                    >
                        <div>
                            <label className="label">
                                <RiMapPinLine
                                    style={{
                                        verticalAlign: 'middle',
                                        marginRight: '0.25rem',
                                    }}
                                />
                                Location
                            </label>

                            <input
                                className={inputCls('location')}
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="e.g. Surat, India"
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="label">
                                Availability
                            </label>

                            <select
                                className="input"
                                name="availability"
                                value={form.availability}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select availability
                                </option>
                                <option value="full-time">
                                    Full-time
                                </option>
                                <option value="part-time">
                                    Part-time
                                </option>
                                <option value="weekdays">
                                    Weekdays only
                                </option>
                                <option value="weekends">
                                    Weekends only
                                </option>
                                <option value="flexible">
                                    Flexible
                                </option>
                                <option value="unavailable">
                                    Currently unavailable
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            Experience Level
                        </label>

                        <div
                            className="experience-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                gap: '0.625rem',
                            }}
                        >
                            {[
                                {
                                    val: 'beginner',
                                    label: '🌱 Beginner',
                                    sub: '0–1 yr',
                                },
                                {
                                    val: 'intermediate',
                                    label: '📈 Intermediate',
                                    sub: '1–3 yrs',
                                },
                                {
                                    val: 'advanced',
                                    label: '🚀 Advanced',
                                    sub: '3–5 yrs',
                                },
                                {
                                    val: 'expert',
                                    label: '💎 Expert',
                                    sub: '5+ yrs',
                                },
                            ].map((option) => (
                                <button
                                    key={option.val}
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            experienceLevel:
                                                option.val,
                                        }))
                                    }
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid',
                                        borderColor:
                                            form.experienceLevel ===
                                                option.val
                                                ? '#8b5cf6'
                                                : 'rgba(42,42,61,0.8)',
                                        background:
                                            form.experienceLevel ===
                                                option.val
                                                ? 'rgba(139,92,246,0.15)'
                                                : 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {option.label.split(' ')[0]}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            color:
                                                form.experienceLevel ===
                                                    option.val
                                                    ? '#a78bfa'
                                                    : '#94a3b8',
                                        }}
                                    >
                                        {option.label
                                            .split(' ')
                                            .slice(1)
                                            .join(' ')}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: '0.65rem',
                                            color: '#64748b',
                                        }}
                                    >
                                        {option.sub}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ───────── Skills ───────── */}

                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: '1rem',
                        }}
                    >
                        🎯 Skills
                    </h3>

                    <div className="skill-section">

                        <div className="skill-section-header">
                            <h4 className="skill-section-title">
                                💡 Skills I Can Teach
                            </h4>

                            <span className="skill-completion">
                                Adds +15% completion
                            </span>
                        </div>

                        <TagInput
                            tags={form.skills_offered}
                            setTags={(tags) =>
                                setForm((prev) => ({
                                    ...prev,
                                    skills_offered: tags,
                                }))
                            }
                            placeholder="Type a skill & press Enter"
                            color="#fbbf24"
                        />

                    </div>

                    <div className="divider" />

                    <div className="skill-section">

                        <div className="skill-section-header">
                            <h4 className="skill-section-title">
                                📚 Skills I Want to Learn
                            </h4>

                            <span className="skill-completion">
                                Adds +10% completion
                            </span>
                        </div>

                        <TagInput
                            tags={form.skills_wanted}
                            setTags={(tags) =>
                                setForm((prev) => ({
                                    ...prev,
                                    skills_wanted: tags,
                                }))
                            }
                            placeholder="Type a skill & press Enter"
                            color="#06b6d4"
                        />

                    </div>
                </div>

                {/* ───────── Social Links ───────── */}

                <div
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}
                        >
                            🔗 Social Links
                        </h3>

                        <span
                            style={{
                                fontSize: '0.72rem',
                                color: '#64748b',
                            }}
                        >
                            Any one adds +10% completion
                        </span>
                    </div>

                    {[
                        {
                            key: 'linkedin',
                            icon: (
                                <RiLinkedinBoxLine
                                    style={{ color: '#0ea5e9' }}
                                />
                            ),
                            label: 'LinkedIn',
                            placeholder:
                                'https://linkedin.com/in/yourname',
                        },
                        {
                            key: 'github',
                            icon: <RiGithubLine />,
                            label: 'GitHub',
                            placeholder:
                                'https://github.com/yourname',
                        },
                        {
                            key: 'portfolio',
                            icon: (
                                <RiGlobalLine
                                    style={{ color: '#a78bfa' }}
                                />
                            ),
                            label: 'Portfolio / Website',
                            placeholder:
                                'https://yoursite.com',
                        },
                        {
                            key: 'twitter',
                            icon: (
                                <RiTwitterLine
                                    style={{ color: '#22d3ee' }}
                                />
                            ),
                            label: 'Twitter / X',
                            placeholder:
                                'https://twitter.com/yourhandle',
                        },
                    ].map(
                        ({
                            key,
                            icon,
                            label,
                            placeholder,
                        }) => (
                            <div key={key}>
                                <label className="label">
                                    {icon}
                                    <span
                                        style={{
                                            marginLeft: '0.3rem',
                                        }}
                                    >
                                        {label}
                                    </span>
                                </label>

                                <input
                                    className={inputCls(
                                        `social_${key}`
                                    )}
                                    name={key}
                                    value={
                                        form.socialLinks[key]
                                    }
                                    onChange={
                                        handleSocialChange
                                    }
                                    placeholder={placeholder}
                                    type="url"
                                />

                                {errors[
                                    `social_${key}`
                                ] && (
                                        <p
                                            style={{
                                                color: '#f87171',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {
                                                errors[
                                                `social_${key}`
                                                ]
                                            }
                                        </p>
                                    )}
                            </div>
                        )
                    )}
                </div>

                {/* ───────── Bottom buttons ───────── */}

                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        paddingBottom: '2rem',
                    }}
                >
                    <Link
                        to="/profile"
                        className="btn-secondary"
                        style={{
                            padding: '0.75rem 1.75rem',
                        }}
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{
                            padding: '0.75rem 2rem',
                        }}
                    >
                        {saving ? (
                            'Saving...'
                        ) : (
                            <>
                                <RiSaveLine />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
            {/* 
            <style>{`
                .input-error {
                    border-color: #f87171 !important;
                }

                @media (max-width: 700px) {
                    .edit-grid-2 {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style> */}
        </div>
        </>
    );
};

export default EditProfile;
