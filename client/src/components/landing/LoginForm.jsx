import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiMail, FiLock, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import Popup from "../common/Popup";

const LoginForm = () => {
  const navigate  = useNavigate();
  const { setUser } = useAuth();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  // Info / error popup
  const [popupOpen,    setPopupOpen]    = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType,    setPopupType]    = useState("error");

  // After success popup is confirmed, what to do
  const [pendingAction, setPendingAction] = useState(null); // "dashboard" | "mentor" | "choose" | "admin"

  // Role-choose modal (shown AFTER success popup OK)
  const [showRoleModal, setShowRoleModal] = useState(false);

  // ── Forgot Password modal state ──────────────────────────────
  const [showForgot,        setShowForgot]        = useState(false);
  const [forgotEmail,       setForgotEmail]       = useState("");
  const [forgotNewPwd,      setForgotNewPwd]      = useState("");
  const [forgotConfirmPwd,  setForgotConfirmPwd]  = useState("");
  const [showForgotNew,     setShowForgotNew]     = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [forgotLoading,     setForgotLoading]     = useState(false);
  const [forgotError,       setForgotError]       = useState("");
  const [forgotSuccess,     setForgotSuccess]     = useState(false);
  const forgotFirstRef = useRef(null);

  /* Close forgot modal & reset all state */
  const closeForgot = () => {
    setShowForgot(false);
    setForgotEmail("");
    setForgotNewPwd("");
    setForgotConfirmPwd("");
    setShowForgotNew(false);
    setShowForgotConfirm(false);
    setForgotError("");
    setForgotSuccess(false);
  };

  /* Auto-focus first input when forgot modal opens */
  useEffect(() => {
    if (showForgot) {
      setTimeout(() => forgotFirstRef.current?.focus(), 50);
    }
  }, [showForgot]);

  /* Handle Escape to close forgot modal */
  useEffect(() => {
    if (!showForgot) return;
    const handler = (e) => { if (e.key === "Escape") closeForgot(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showForgot]);

  /* Forgot password submit */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await axios.post(
        "https://skillssync-a4r9.onrender.com/api/auth/forgot-password",
        { email: forgotEmail, newPassword: forgotNewPwd, confirmPassword: forgotConfirmPwd }
      );
      if (res.data.success) {
        setForgotSuccess(true);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Handle login submit ── */
  const HandleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setPopupMessage("Please enter email and password");
      setPopupType("error");
      setPopupOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://skillssync-a4r9.onrender.com/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        const user = res.data.user;
        setUser(user);

        // Decide what to do AFTER the success popup OK is clicked
        let action;
        if (user.role === "admin") {
          action = "admin";
        } else if (user.isMentor === true) {
          // isMentor=true regardless of role (could be "student" or "mentor")
          // → always show the choose popup so they pick which dashboard
          action = "choose";
        } else {
          // Pure student (role="student", isMentor=false)
          action = "dashboard";
        }

        setPendingAction(action);
        setPopupMessage("Login Successful! 🎉");
        setPopupType("success");
        setPopupOpen(true);
      }
    } catch (error) {
      if (error.response?.data?.pending) {
        setPopupMessage("Your mentor application is still under review by admin.");
        setPopupType("warning");
        setPopupOpen(true);
        return;
      }
      if (error.response?.data?.rejected) {
        setPopupMessage("Your mentor application was rejected by admin.");
        setPopupType("error");
        setPopupOpen(true);
        return;
      }
      setPopupMessage(error.response?.data?.message || "Login failed. Please try again.");
      setPopupType("error");
      setPopupOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /* ── Called when user clicks OK on the success popup ── */
  const handlePopupConfirm = () => {
    setPopupOpen(false);
    if (pendingAction === "admin")     { navigate("/admin");     return; }
    if (pendingAction === "dashboard") { localStorage.removeItem("activeRole"); navigate("/dashboard"); return; }
    if (pendingAction === "mentor")    { localStorage.setItem("activeRole", "mentor"); navigate("/mentor"); return; }
    if (pendingAction === "choose")    { setShowRoleModal(true); return; }
  };

  return (
    <>
      <div className="w-full max-w-120 text-slate-900 dark:text-white">
        <Link to="/" className="text-sm">← Back to Home</Link>

        {/* Header */}
        <div className="flex items-center justify-end gap-4 mb-2">
          <p className="text-gray-500 dark:text-slate-400">New Here?</p>
          <Link to="/register" className="px-5 py-2 transition border border-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white">
            Create Account
          </Link>
        </div>

        <h3 className="text-lg text-gray-500 dark:text-slate-400">Welcome Back! 👋</h3>
        <h1 className="mt-2 text-4xl font-bold leading-tight">
          Let's get you<br />
          back to{" "}
          <span className="text-transparent bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text">learning.</span>
        </h1>
        <p className="mt-2 mb-6 text-gray-500 dark:text-slate-400">Log in with your registered email.</p>

        {/* ── Wrap in <form> so Enter key submits in any field ── */}
        <form onSubmit={HandleSubmit} noValidate>

          {/* Email */}
          <label htmlFor="login-email" className="font-semibold">Email Address</label>
          <div className="relative mt-2 mb-4">
            <FiMail className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              id="login-email" type="email" name="login-email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" autoComplete="username"
              className="w-full p-3.5 border border-slate-300 dark:border-slate-600 outline-none rounded-xl pl-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between">
            <label htmlFor="login-password" className="font-semibold">Password</label>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative mt-2">
            <FiLock className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              id="login-password" type={showPassword ? "text" : "password"} name="login-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" autoComplete="current-password"
              className="w-full p-4 bg-white border outline-none border-slate-300 dark:border-slate-600 rounded-xl pl-11 pr-11 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-500 -translate-y-1/2 dark:text-gray-400 right-4 top-1/2">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Login Button — type="submit" so Enter in any field submits */}
          <button type="submit" disabled={loading}
            className="w-full p-4 mt-6 cursor-pointer text-lg font-semibold text-white duration-300 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* OR */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300 dark:bg-slate-600"></div>
          <span className="mx-4 text-gray-500 dark:text-slate-400">OR</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-slate-600"></div>
        </div>

        {/* Google */}
        <button type="button" className="flex items-center justify-center w-full gap-2 p-4 transition border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white">
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </button>

        {/* Sign Up */}
        <p className="mt-3 text-center text-slate-900 dark:text-slate-300">
          Don't have an account?
          <Link to="/register" className="font-semibold text-indigo-600 cursor-pointer dark:text-indigo-400"> Sign Up</Link>
        </p>
      </div>

      {/* ── Success / error / warning popup ── */}
      <Popup
        open={popupOpen}
        message={popupMessage}
        type={popupType}
        onClose={() => {
          setPopupOpen(false);
          // Only navigate if it's NOT a success popup (errors just dismiss)
          if (popupType !== "success") return;
          handlePopupConfirm();
        }}
        onConfirm={handlePopupConfirm}
      />

      {/* ── Role-choose modal — appears AFTER success popup OK ── */}
      {showRoleModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            width: 380,
            textAlign: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔀</div>
            <h2 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Choose Account Type
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.6 }}>
              You have both <strong style={{ color: "#818cf8" }}>Student</strong> and{" "}
              <strong style={{ color: "#a78bfa" }}>Mentor</strong> access.<br />
              Which dashboard would you like to open?
            </p>

            <button
              style={{
                width: "100%", padding: "0.9rem", marginBottom: "0.75rem",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                border: "none", borderRadius: 12,
                color: "#fff", fontSize: "1rem", fontWeight: 600,
                cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => {
                localStorage.setItem("activeRole", "student");
                navigate("/dashboard");
              }}
            >
              🎓 Student Dashboard
            </button>

            <button
              style={{
                width: "100%", padding: "0.9rem",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                border: "none", borderRadius: 12,
                color: "#fff", fontSize: "1rem", fontWeight: 600,
                cursor: "pointer", transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => {
                localStorage.setItem("activeRole", "mentor");
                navigate("/mentor");
              }}
            >
              👨‍🏫 Mentor Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Forgot Password Modal ─────────────────────────────────── */}
      {showForgot && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={closeForgot}
        >
          <div
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "2rem",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-pwd-title"
          >
            {/* Close × */}
            <button
              type="button"
              onClick={closeForgot}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "transparent", border: "none",
                color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: "50%",
              }}
              onMouseOver={e => e.currentTarget.style.color = "#e2e8f0"}
              onMouseOut={e  => e.currentTarget.style.color = "#94a3b8"}
              aria-label="Close"
            >
              <FiX />
            </button>

            {/* Title */}
            <h2
              id="forgot-pwd-title"
              style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.25rem" }}
            >
              Forgot Password?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Enter your registered email and set a new password.
            </p>

            {/* Success state */}
            {forgotSuccess ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                <h3 style={{ color: "#34d399", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                  Password changed successfully!
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                  You can now log in with your new password.
                </p>
                <button
                  type="button"
                  onClick={closeForgot}
                  style={{
                    padding: "0.75rem 2rem", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    color: "#fff", fontWeight: 600, fontSize: "1rem",
                    cursor: "pointer", width: "100%",
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              /* ── Forgot form — Enter submits via onSubmit ── */
              <form onSubmit={handleForgotSubmit} noValidate>

                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem" }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <FiMail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      ref={forgotFirstRef}
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      autoComplete="email"
                      style={{
                        width: "100%", padding: "0.875rem 0.875rem 0.875rem 2.75rem",
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: 12, color: "#e2e8f0", fontSize: "0.9rem",
                        outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e  => e.target.style.borderColor = "#334155"}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <FiLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showForgotNew ? "text" : "password"}
                      value={forgotNewPwd}
                      onChange={e => setForgotNewPwd(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      style={{
                        width: "100%", padding: "0.875rem 2.75rem 0.875rem 2.75rem",
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: 12, color: "#e2e8f0", fontSize: "0.9rem",
                        outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e  => e.target.style.borderColor = "#334155"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNew(v => !v)}
                      style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "transparent", border: "none", color: "#64748b",
                        cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                    >
                      {showForgotNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.4rem" }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <FiLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type={showForgotConfirm ? "text" : "password"}
                      value={forgotConfirmPwd}
                      onChange={e => setForgotConfirmPwd(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      style={{
                        width: "100%", padding: "0.875rem 2.75rem 0.875rem 2.75rem",
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: 12, color: "#e2e8f0", fontSize: "0.9rem",
                        outline: "none", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e  => e.target.style.borderColor = "#334155"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirm(v => !v)}
                      style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "transparent", border: "none", color: "#64748b",
                        cursor: "pointer", display: "flex", alignItems: "center",
                      }}
                    >
                      {showForgotConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {forgotError && (
                  <p style={{
                    color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8, padding: "0.5rem 0.75rem",
                  }}>
                    {forgotError}
                  </p>
                )}

                {/* Submit — type="submit" so Enter key in any field triggers this */}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: 12, border: "none",
                    background: forgotLoading
                      ? "rgba(99,102,241,0.5)"
                      : "linear-gradient(135deg,#2563eb,#7c3aed)",
                    color: "#fff", fontWeight: 600, fontSize: "1rem",
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                  }}
                >
                  {forgotLoading ? "Changing..." : "Change Password"}
                </button>

              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
