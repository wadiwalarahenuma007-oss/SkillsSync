import { useEffect, useState } from "react";
import axios from "axios";

import {
    RiShieldCheckLine,
    RiTimeLine,
    RiCheckLine,
    RiCloseLine,
    RiAlertLine,
    RiLoader4Line,
} from "react-icons/ri";

import "../../styles/Admin/AdminMentors.css";

/* ── Inline confirmation modal ── */
const ConfirmModal = ({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
            <div style={{
                background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, padding: "2rem", width: 380, textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    {confirmColor === "red" ? "⚠️" : confirmColor === "orange" ? "🔄" : "✅"}
                </div>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.75rem", lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: "0.75rem",
                            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10, color: "#94a3b8", fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: "0.75rem", border: "none", borderRadius: 10,
                            background: confirmColor === "red" ? "#dc2626" : confirmColor === "orange" ? "#d97706" : "#16a34a",
                            color: "#fff", fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Toast-style result notification ── */
const Toast = ({ open, message, type, onClose }) => {
    useEffect(() => {
        if (open) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }
    }, [open]);
    if (!open) return null;
    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            background: type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${type === "success" ? "#22c55e" : "#ef4444"}`,
            borderRadius: 12, padding: "0.875rem 1.25rem",
            color: "#fff", fontSize: "0.9rem", fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
            {type === "success" ? "✅" : "❌"} {message}
        </div>
    );
};

const AdminMentors = () => {
    const [applications, setApplications] = useState([]);
    const [activeTab,    setActiveTab]    = useState("pending");
    const [loading,      setLoading]      = useState(true);

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({
        open: false, title: "", message: "", confirmLabel: "", confirmColor: "green", action: null,
    });

    // Toast state
    const [toast, setToast] = useState({ open: false, message: "", type: "success" });

    const showToast = (message, type = "success") => setToast({ open: true, message, type });

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/admin/mentor-applications",
                { withCredentials: true }
            );
            setApplications(data.applications || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const pendingMentors  = applications.filter((m) => m.status === "pending");
    const approvedMentors = applications.filter((m) => m.status === "approved" || m.mentorApplicationStatus === "approved");
    const visibleMentors  = activeTab === "pending" ? pendingMentors : approvedMentors;

    /* ── Approve ── */
    const handleApprove = (mentor) => {
        if (!mentor.user?._id) { showToast("User not found for this application", "error"); return; }
        setConfirmModal({
            open: true,
            title: "Approve Mentor",
            message: `Approve ${mentor.user?.name} as a mentor? They will get access to the Mentor Dashboard.`,
            confirmLabel: "Yes, Approve",
            confirmColor: "green",
            action: async () => {
                try {
                    const { data } = await axios.put(
                        `https://skillssync-a4r9.onrender.com/api/admin/mentors/${mentor.user._id}/approve`,
                        {}, { withCredentials: true }
                    );
                    showToast(data.message || "Mentor approved!", "success");
                    fetchApplications();
                } catch (e) {
                    showToast(e.response?.data?.message || "Approval failed", "error");
                }
            },
        });
    };

    /* ── Reject ── */
    const handleReject = (mentor) => {
        if (!mentor.user?._id) { showToast("User not found for this application", "error"); return; }
        setConfirmModal({
            open: true,
            title: "Reject Application",
            message: `Reject ${mentor.user?.name}'s mentor application? They will be notified.`,
            confirmLabel: "Yes, Reject",
            confirmColor: "red",
            action: async () => {
                try {
                    const { data } = await axios.put(
                        `https://skillssync-a4r9.onrender.com/api/admin/mentors/${mentor.user._id}/reject`,
                        {}, { withCredentials: true }
                    );
                    showToast(data.message || "Application rejected", "success");
                    fetchApplications();
                } catch (e) {
                    showToast(e.response?.data?.message || "Rejection failed", "error");
                }
            },
        });
    };

    /* ── Revoke ── */
    const handleRevoke = (mentor) => {
        if (!mentor.user?._id) { showToast("User not found", "error"); return; }
        setConfirmModal({
            open: true,
            title: "Revoke Verification",
            message: `Revoke mentor status from ${mentor.user?.name}? They will lose Mentor Dashboard access.`,
            confirmLabel: "Yes, Revoke",
            confirmColor: "orange",
            action: async () => {
                try {
                    const { data } = await axios.put(
                        `https://skillssync-a4r9.onrender.com/api/admin/mentors/${mentor.user._id}/revoke`,
                        {}, { withCredentials: true }
                    );
                    showToast(data.message || "Mentor revoked", "success");
                    fetchApplications();
                } catch (e) {
                    showToast(e.response?.data?.message || "Revoke failed", "error");
                }
            },
        });
    };

    const closeModal = () => setConfirmModal((m) => ({ ...m, open: false, action: null }));
    const runAction  = async () => {
        const fn = confirmModal.action;
        closeModal();
        if (fn) await fn();
    };

    return (
        <div className="admin-mentors-page">

            {/* Header */}
            <div className="admin-mentors-header">
                <div className="mentor-title-icon"><RiShieldCheckLine /></div>
                <div>
                    <h1>Mentor Management</h1>
                    <p>{pendingMentors.length} pending · {approvedMentors.length} approved</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mentor-tabs">
                <button type="button"
                    className={activeTab === "pending" ? "mentor-tab active" : "mentor-tab"}
                    onClick={() => setActiveTab("pending")}
                >
                    <RiTimeLine /> Pending ({pendingMentors.length})
                </button>
                <button type="button"
                    className={activeTab === "approved" ? "mentor-tab active" : "mentor-tab"}
                    onClick={() => setActiveTab("approved")}
                >
                    <RiCheckLine /> Approved ({approvedMentors.length})
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem", color: "#94a3b8", gap: "0.75rem" }}>
                    <RiLoader4Line size={24} style={{ animation: "spin 1s linear infinite" }} />
                    Loading applications...
                </div>
            ) : (
                <>
                    {/* Mentor Cards */}
                    <div className="mentor-grid">
                        {visibleMentors.map((mentor) => (
                            <div className="mentor-card" key={mentor._id}>

                                {/* Top */}
                                <div className="mentor-card-top">
                                    <div className="mentor-avatar">
                                        {mentor.user?.profilePicture ? (
                                            <img
                                                src={
                                                    mentor.user.profilePicture.startsWith("http")
                                                        ? mentor.user.profilePicture
                                                        : `https://skillssync-a4r9.onrender.com/${mentor.user.profilePicture.replace(/^\//, "")}`
                                                }
                                                alt={mentor.user?.name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                            />
                                        ) : (
                                            mentor.user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="mentor-basic-info">
                                        <h3>{mentor.user?.name}</h3>
                                        <p>{mentor.user?.email}</p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="mentor-skills">
                                    {mentor.skills?.map((skill, idx) => <span key={idx}>{skill}</span>)}
                                </div>

                                {/* Meta */}
                                <div className="mentor-meta-grid">
                                    <div className="mentor-meta-item">
                                        <span>Qualification</span>
                                        <strong>{mentor.qualification || "N/A"}</strong>
                                    </div>
                                    <div className="mentor-meta-item">
                                        <span>Experience</span>
                                        <strong>{mentor.experience || "N/A"}</strong>
                                    </div>
                                    <div className="mentor-meta-item">
                                        <span>Teaching</span>
                                        <strong>{mentor.teachingMode || "N/A"}</strong>
                                    </div>
                                    <div className="mentor-meta-item">
                                        <span>Language</span>
                                        <strong>{mentor.language || "N/A"}</strong>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="mentor-bio">{mentor.bio}</p>

                                {/* Actions */}
                                <div className="mentor-actions">
                                    {mentor.status === "pending" ? (
                                        <>
                                            <button type="button" className="approve-mentor-btn" onClick={() => handleApprove(mentor)}>
                                                <RiCheckLine /> Approve
                                            </button>
                                            <button type="button" className="reject-mentor-btn" onClick={() => handleReject(mentor)}>
                                                <RiCloseLine /> Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button type="button" className="revoke-mentor-btn" onClick={() => handleRevoke(mentor)}>
                                            Revoke Verification
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {visibleMentors.length === 0 && (
                        <div className="mentor-empty">
                            <RiShieldCheckLine />
                            <h3>No {activeTab} mentors</h3>
                            <p>There are currently no mentors in this section.</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Confirmation modal ── */}
            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                confirmColor={confirmModal.confirmColor}
                onConfirm={runAction}
                onCancel={closeModal}
            />

            {/* ── Toast notification ── */}
            <Toast
                open={toast.open}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
            />
        </div>
    );
};

export default AdminMentors;
