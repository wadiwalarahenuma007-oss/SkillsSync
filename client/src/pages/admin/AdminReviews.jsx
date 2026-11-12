import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    RiStarFill,
    RiSearchLine,
    RiDeleteBinLine,
    RiLoader4Line,
} from "react-icons/ri";

import "../../styles/Admin/AdminReviews.css";

const AdminReviews = () => {
    // const [reviews, setReviews]         = useState([]);
    const [reviews, setReviews] = useState([
    {
        _id: "demo-review-1",
        student: {
            name: "Rahul Sharma",
            email: "rahul@example.com"
        },
        mentor: {
            name: "Pankaj"
        },
        skill: "Flutter",
        rating: 5,
        comment: "Excellent mentor! Explained Flutter concepts very clearly.",
        createdAt: "2026-08-25T10:30:00.000Z"
    },
    {
        _id: "demo-review-2",
        student: {
            name: "Priya Patel",
            email: "priya@example.com"
        },
        mentor: {
            name: "Pranay"
        },
        skill: "Node.js",
        rating: 4,
        comment: "Very helpful session and good guidance throughout.",
        createdAt: "2026-08-26T14:15:00.000Z"
    }
]);
    const [loading, setLoading]         = useState(false);
    const [search, setSearch]           = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");

    // useEffect(() => { fetchReviews(); }, []);

    // const fetchReviews = async () => {
    //     setLoading(true);
    //     try {
    //         const res = await axios.get("https://skillssync-a4r9.onrender.com/api/admin/reviews", { withCredentials: true });
    //         setReviews(res.data.reviews || []);
    //     } catch (err) {
    //         console.error("Admin reviews fetch error:", err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const deleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to remove this review?")) return;
        try {
            await axios.delete(`https://skillssync-a4r9.onrender.com/api/admin/reviews/${id}`, { withCredentials: true });
            setReviews(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete review.");
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const searchText = search.toLowerCase();
        const studentName = review.student?.name || "";
        const mentorName  = review.mentor?.name  || "";
        const matchesSearch =
            studentName.toLowerCase().includes(searchText) ||
            mentorName.toLowerCase().includes(searchText) ||
            (review.skill || "").toLowerCase().includes(searchText) ||
            (review.comment || "").toLowerCase().includes(searchText);
        const matchesRating = ratingFilter === "all" || review.rating === Number(ratingFilter);
        return matchesSearch && matchesRating;
    });

    const renderStars = (rating) => (
        <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <RiStarFill key={star} className={star <= rating ? "star-filled" : "star-empty"} />
            ))}
        </div>
    );

    const fmtDate = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="admin-reviews-page">

            {/* Header */}
            <div className="reviews-page-header">
                <div>
                    <h1><RiStarFill /> Reviews &amp; Feedback</h1>
                    <p>Monitor ratings and feedback from the community.</p>
                </div>
                <div className="reviews-total">
                    {loading ? "..." : `${reviews.length} Total Reviews`}
                </div>
            </div>

            {/* Filters */}
            <div className="reviews-toolbar">
                <div className="review-search">
                    <RiSearchLine />
                    <input type="text" placeholder="Search reviewer, mentor or skill..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="rating-filter" value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}>
                    <option value="all">All Ratings</option>
                    <option value="5">⭐ 5 Stars</option>
                    <option value="4">⭐ 4 Stars</option>
                    <option value="3">⭐ 3 Stars</option>
                    <option value="2">⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
                </select>
            </div>

            {/* Reviews table */}
            <div className="reviews-table-card">
                <div className="reviews-table-wrapper">
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>REVIEWER</th>
                                <th>MENTOR</th>
                                <th>SKILL</th>
                                <th>RATING</th>
                                <th>FEEDBACK</th>
                                <th>DATE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                        <RiLoader4Line style={{ fontSize: "1.5rem", animation: "spin 1s linear infinite" }} />
                                        <div style={{ marginTop: "0.5rem" }}>Loading reviews...</div>
                                    </td>
                                </tr>
                            ) : filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <tr key={review._id}>
                                        {/* Reviewer */}
                                        <td>
                                            <div className="review-user">
                                                <div className="review-avatar">
                                                    {(review.student?.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>{review.student?.name || "Unknown"}</strong>
                                                    <span>{review.student?.email || ""}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Mentor */}
                                        <td>
                                            <span className="mentor-name">{review.mentor?.name || "Unknown"}</span>
                                        </td>
                                        {/* Skill */}
                                        <td>
                                            <span className="review-skill">{review.skill || "—"}</span>
                                        </td>
                                        {/* Rating */}
                                        <td>
                                            <div className="rating-wrapper">
                                                {renderStars(review.rating)}
                                                <span>{review.rating}.0</span>
                                            </div>
                                        </td>
                                        {/* Feedback */}
                                        <td>
                                            <p className="review-text">{review.comment || "—"}</p>
                                        </td>
                                        {/* Date */}
                                        <td>
                                            <span className="review-date">{fmtDate(review.createdAt)}</span>
                                        </td>
                                        {/* Actions */}
                                        <td>
                                            <div className="review-actions">
                                                <button type="button" className="delete-review-btn"
                                                    onClick={() => deleteReview(review._id)} title="Remove review">
                                                    <RiDeleteBinLine />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-reviews">
                                        <RiSearchLine />
                                        <strong>No reviews found</strong>
                                        <span>
                                            {search || ratingFilter !== "all"
                                                ? "Try changing your search or rating filter."
                                                : "No reviews submitted yet."}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
