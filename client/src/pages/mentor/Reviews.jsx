import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Mentor/Reviews.css";

import {
  RiStarLine,
  RiStarFill,
  RiSearchLine,
  RiBarChartBoxLine,
  RiChatSmile2Line,
} from "react-icons/ri";

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <RiStarFill
      key={i}
      style={{ color: i < rating ? "#fbbf24" : "rgba(255,255,255,0.15)" }}
    />
  ));

const MentorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`https://skillssync-a4r9.onrender.com/api/reviews/mentor/${user._id}`, {
          withCredentials: true,
        });
        setReviews(res.data.reviews || []);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));

  const fiveStarReviews = reviews.filter(r => Math.round(r.rating) === 5).length;
  const fiveStarPct = totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0;

  const filtered = reviews.filter((r) => {
    const studentName = r.student?.name || "Unknown Student";
    const skill = r.request?.skill || "General Session";
    return (
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      skill.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="mentor-reviews-page">
      {/* ── HEADER ── */}
      <div className="reviews-topbar">
        <div>
          <h1>
            <RiStarLine />
            Student <span>Reviews</span>
          </h1>
          <p>{totalReviews} total reviews</p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="reviews-stats">
        <div className="review-stat-card">
          <div className="review-stat-icon icon-gold">
            <RiStarFill />
          </div>
          <div className="review-stat-info">
            <h2>{avgRating}</h2>
            <p>Average Rating</p>
            <div className="review-stat-sub">Out of 5.0</div>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon icon-purple">
            <RiChatSmile2Line />
          </div>
          <div className="review-stat-info">
            <h2>{totalReviews}</h2>
            <p>Total Reviews</p>
            <div className="review-stat-sub">All time</div>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon icon-cyan">
            <RiBarChartBoxLine />
          </div>
          <div className="review-stat-info">
            <h2>{fiveStarPct}%</h2>
            <p>5-Star Reviews</p>
            <div className="review-stat-sub">{fiveStarReviews} of {totalReviews} reviews</div>
          </div>
        </div>
      </div>

      {/* ── BREAKDOWN + SEARCH ── */}
      <div className="reviews-two-col">
        {/* Rating Breakdown */}
        <div className="rating-breakdown-card">
          <div className="reviews-card-title">
            <RiBarChartBoxLine />
            Rating Breakdown
          </div>

          <div className="rating-bar-rows">
            {ratingBreakdown.map(({ stars, count }) => {
              const max = Math.max(...ratingBreakdown.map((r) => r.count));
              const pct = max > 0 ? Math.round((count / max) * 100) : 0;
              return (
                <div key={stars} className="rating-bar-row">
                  <div className="rating-bar-label">
                    <span>{stars}</span>
                    <RiStarFill />
                  </div>
                  <div className="rating-bar-track">
                    <div
                      className="rating-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="rating-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Box */}
        <div className="reviews-search-card">
          <div className="reviews-card-title">
            <RiSearchLine />
            Search Reviews
          </div>

          <div className="review-search-box">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by student, skill or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── REVIEWS LIST ── */}
      <div className="reviews-list-card">
        <div className="reviews-list-header">
          <div className="reviews-card-title">
            <RiChatSmile2Line />
            Student Feedback
          </div>
          <span className="review-count-badge">
            {filtered.length} reviews
          </span>
        </div>

        <div className="reviews-list">
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              Loading reviews...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              No reviews yet.
            </div>
          ) : (
            filtered.map((review) => {
              const studentName = review.student?.name || "Unknown Student";
              const initials = studentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
              const skill = review.request?.skill || "General Session";
              const date = new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
              });

              return (
                <div key={review._id} className="review-card">
                  <div className="review-card-top">
                    <div className="reviewer-avatar">
                      {review.student?.profilePicture ? (
                        <img src={review.student.profilePicture} alt={studentName} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                      ) : initials}
                    </div>
                    <div className="reviewer-info">
                      <h4>{studentName}</h4>
                      <div className="reviewer-meta">
                        <span className="reviewer-skill">{skill}</span>
                        <div className="review-stars">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <span className="review-date">{date}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorReviews;

