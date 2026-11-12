import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { createPortal } from "react-dom";
import '../../styles/Student/FindMentors.css';
import {
    RiSearchLine,
    RiFilter3Line,
    RiStarFill,
    RiUserLine,
    RiSendPlaneLine,
    RiShieldCheckLine,
    RiCloseLine,
    RiCheckLine,
    RiErrorWarningLine,
    RiLoader4Line,
} from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   Star Rating
   ========================================================= */
const StarRating = ({ rating }) => (
    <div className="mentor-rating">
        {[1, 2, 3, 4, 5].map((star) => (
            <RiStarFill
                key={star}
                className={star <= Math.round(rating) ? "mentor-star" : "mentor-star-empty"}
            />
        ))}
        <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
    </div>
);

/* =========================================================
   Inline success / error modal (portal)
   ========================================================= */
const InfoModal = ({ modal, onClose }) => {
    if (!modal) return null;
    return createPortal(
        <div className="mentor-modal-overlay" onClick={onClose}>
            <div
                className="mentor-request-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ textAlign: "center", maxWidth: 380 }}
            >
                <div style={{
                    width: 56, height: 56, borderRadius: "50%", margin: "0 auto 1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: modal.type === "success" ? "rgba(52,211,153,.15)" : "rgba(239,68,68,.12)",
                }}>
                    {modal.type === "success"
                        ? <RiCheckLine size={28} style={{ color: "#34d399" }} />
                        : <RiErrorWarningLine size={28} style={{ color: "#f87171" }} />}
                </div>
                <h2 style={{ margin: "0 0 .5rem", fontSize: "1.1rem" }}>
                    {modal.type === "success" ? "Success!" : "Error"}
                </h2>
                <p style={{ margin: "0 0 1.25rem", color: "#94a3b8", fontSize: ".9rem" }}>
                    {modal.message}
                </p>
                <button className="send-request-btn" onClick={onClose}>OK</button>
            </div>
        </div>,
        document.body
    );
};

/* =========================================================
   Find Mentors Page
   ========================================================= */
const FindMentors = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [mentors,    setMentors]    = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError,   setFetchError]   = useState("");

    const [search,       setSearch]       = useState(searchParams.get("search") || "");
    const [skillFilter,  setSkillFilter]  = useState(searchParams.get("skill")  || "");
    const [experience,   setExperience]   = useState("all");
    const [rating,       setRating]       = useState("all");
    const [availability, setAvailability] = useState("all");

    const [selectedMentor, setSelectedMentor] = useState(null);
    const [message,        setMessage]         = useState("");
    const [sending,        setSending]          = useState(false);
    const [modal,          setModal]            = useState(null);

    /* ── Fetch approved mentors ── */
    useEffect(() => {
        const fetchMentors = async () => {
            setFetchLoading(true);
            setFetchError("");
            try {
                const res = await axios.get("https://skillssync-a4r9.onrender.com/api/mentors", {
                    withCredentials: true,
                });
                setMentors(res.data.mentors || []);
            } catch (err) {
                setFetchError(err.response?.data?.message || "Failed to load mentors.");
            } finally {
                setFetchLoading(false);
            }
        };
        fetchMentors();
    }, []);

    /* ── Client-side filter ── */
    const filteredMentors = useMemo(() => {
        return mentors.filter((mentor) => {
            const searchText = search.toLowerCase().trim();
            const matchesSearch =
                !searchText ||
                mentor.name.toLowerCase().includes(searchText) ||
                (mentor.skills || []).some((s) => s.toLowerCase().includes(searchText));

            const matchesSkill =
                !skillFilter ||
                (mentor.skills || []).some((s) =>
                    s.toLowerCase().includes(skillFilter.toLowerCase())
                );

            const matchesExperience =
                experience === "all" ||
                (mentor.experienceLevel || "").toLowerCase() === experience.toLowerCase();

            const matchesRating =
                rating === "all" || mentor.rating >= Number(rating);

            const matchesAvailability =
                availability === "all" ||
                (mentor.availability || "").toLowerCase() === availability.toLowerCase();

            return matchesSearch && matchesSkill && matchesExperience && matchesRating && matchesAvailability;
        });
    }, [mentors, search, skillFilter, experience, rating, availability]);

    /* ── Send request ── */
    const handleSendRequest = async () => {
        if (!selectedMentor) return;
        setSending(true);
        try {
            await axios.post(
                "https://skillssync-a4r9.onrender.com/api/requests",
                {
                    mentorId: selectedMentor._id,
                    message: message.trim(),
                    skill: (selectedMentor.skills || [])[0] || "",
                },
                { withCredentials: true }
            );
            setModal({ type: "success", message: `Request sent to ${selectedMentor.name}! They will respond soon.` });
            setSelectedMentor(null);
            setMessage("");
        } catch (err) {
            setModal({ type: "error", message: err.response?.data?.message || "Failed to send request." });
        } finally {
            setSending(false);
        }
    };

    /* ── Avatar helper ── */
    const avatarSrc = (mentor) => {
        if (mentor.profilePicture) {
            return mentor.profilePicture.startsWith("http")
                ? mentor.profilePicture
                : `https://skillssync-a4r9.onrender.com${mentor.profilePicture}`;
        }
        return null;
    };

    return (
        <div className="find-mentors-page">

            {/* HERO */}
            <section className="find-mentors-hero">
                <div className="find-mentors-hero-content">
                    <h1>Find <span>Mentors</span></h1>
                    <p>Connect with expert mentors and accelerate your learning journey.</p>

                    <div className="mentor-search-box">
                        <RiSearchLine />
                        <input
                            type="text"
                            placeholder="Search by skill or mentor name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {(search || skillFilter) && (
                            <button
                                onClick={() => { setSearch(""); setSkillFilter(""); }}
                                className="clear-search"
                            >
                                <RiCloseLine />
                            </button>
                        )}
                    </div>

                    {skillFilter && (
                        <div style={{ marginTop: ".75rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
                            <span style={{ fontSize: ".85rem", color: "#94a3b8" }}>Filtering by skill:</span>
                            <span style={{
                                padding: ".2rem .75rem", borderRadius: "9999px", fontSize: ".8rem", fontWeight: 600,
                                background: "rgba(139,92,246,.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,.3)"
                            }}>
                                {skillFilter}
                            </span>
                            <button
                                onClick={() => setSkillFilter("")}
                                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: ".8rem" }}
                            >
                                ✕ Remove
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* FILTER BAR */}
            <section className="mentor-filter-bar">
                <div className="filter-title">
                    <RiFilter3Line />
                    <span>Filters:</span>
                </div>

                <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                    <option value="all">All Experience Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                </select>

                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="all">Any Rating</option>
                    <option value="4">4+ Rating</option>
                    <option value="4.5">4.5+ Rating</option>
                    <option value="4.7">4.7+ Rating</option>
                </select>

                <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="all">Any Availability</option>
                    <option value="flexible">Flexible</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both</option>
                </select>

                <div className="mentor-count">
                    <strong>{filteredMentors.length}</strong>{" "}
                    {filteredMentors.length === 1 ? "mentor" : "mentors"} found
                </div>
            </section>

            {/* CONTENT */}
            {fetchLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "1rem", color: "#94a3b8" }}>
                    <RiLoader4Line size={40} style={{ animation: "spin 1s linear infinite" }} />
                    <p>Loading mentors...</p>
                </div>
            ) : fetchError ? (
                <div className="mentor-empty-state">
                    <div><RiErrorWarningLine size={40} /></div>
                    <h3>Could not load mentors</h3>
                    <p>{fetchError}</p>
                </div>
            ) : filteredMentors.length > 0 ? (
                <section className="mentors-grid">
                    {filteredMentors.map((mentor) => {
                        const src = avatarSrc(mentor);
                        return (
                            <article className="mentor-card" key={mentor._id}>
                                {/* Top */}
                                <div className="mentor-card-top">
                                    <div className="mentor-avatar">
                                        {src
                                            ? <img src={src} alt={mentor.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                            : mentor.name?.charAt(0)?.toUpperCase()
                                        }
                                    </div>

                                    <div className="mentor-basic-info">
                                        <div className="mentor-name-row">
                                            <h3>{mentor.name}</h3>
                                            {mentor.isVerified && (
                                                <RiShieldCheckLine className="verified-icon" />
                                            )}
                                        </div>

                                        <StarRating rating={mentor.rating || 0} />

                                        <div className="mentor-meta">
                                            {mentor.experienceLevel && <span>{mentor.experienceLevel}</span>}
                                            {mentor.experienceLevel && mentor.availability && " • "}
                                            {mentor.availability && <span style={{ textTransform: "capitalize" }}>{mentor.availability}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                {mentor.bio && (
                                    <p className="mentor-bio">{mentor.bio}</p>
                                )}

                                {/* Skills */}
                                {(mentor.skills || []).length > 0 && (
                                    <div className="mentor-skills">
                                        {mentor.skills.map((skill) => (
                                            <span key={skill}>{skill}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Qualification */}
                                {mentor.qualification && (
                                    <p style={{ fontSize: ".78rem", color: "#64748b", margin: ".25rem 0 0", fontStyle: "italic" }}>
                                        🎓 {mentor.qualification}
                                    </p>
                                )}

                                {/* Bottom */}
                                <div className="mentor-card-bottom">
                                    <div className="mentor-sessions">
                                        <RiUserLine />
                                        <span>{mentor.totalRatings || 0} reviews</span>
                                    </div>

                                    <button
                                        className="send-request-btn"
                                        onClick={() => { setSelectedMentor(mentor); setMessage(""); }}
                                    >
                                        <RiSendPlaneLine />
                                        Send Request
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <div className="mentor-empty-state">
                    <div><RiSearchLine /></div>
                    <h3>No mentors found</h3>
                    <p>Try changing your search or filters.</p>
                    <button onClick={() => { setSearch(""); setSkillFilter(""); setExperience("all"); setRating("all"); setAvailability("all"); }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {/* SEND REQUEST MODAL */}
            {selectedMentor && (
                <div className="mentor-modal-overlay" onClick={() => setSelectedMentor(null)}>
                    <div
                        className="mentor-request-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={() => setSelectedMentor(null)}>
                            <RiCloseLine />
                        </button>

                        <div className="modal-avatar">
                            {avatarSrc(selectedMentor)
                                ? <img src={avatarSrc(selectedMentor)} alt={selectedMentor.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                : selectedMentor.name?.charAt(0)?.toUpperCase()
                            }
                        </div>

                        <h2>Send Request to <span>{selectedMentor.name}</span></h2>
                        <p>Send a mentorship request. You can add a short message explaining what you want to learn.</p>

                        <textarea
                            placeholder="Write a message... (optional)"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
                        />

                        <button
                            className="send-request-btn modal-send-btn"
                            onClick={handleSendRequest}
                            disabled={sending}
                        >
                            <RiSendPlaneLine />
                            {sending ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </div>
            )}

            {/* INFO MODAL */}
            <InfoModal modal={modal} onClose={() => setModal(null)} />
        </div>
    );
};

export default FindMentors;
