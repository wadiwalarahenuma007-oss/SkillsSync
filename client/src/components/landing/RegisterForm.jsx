import { useState } from "react";
// api
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import Popup from "../common/Popup";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiGithub,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/Logo.png";
import { Link, useNavigate } from "react-router-dom";

const CreateAccountForm = () => {
  const skillOptions = [
    "Web Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "React.js",
    "Node.js",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "PHP",
    "Flutter",
    "Android Development",
    "iOS Development",
    "UI/UX Design",
    "Figma",
    "Graphic Design",
    "Photography",
    "Videography",
    "Video Editing",
    "Photo Editing",
    "Content Writing",
    "Copywriting",
    "Blogging",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Cyber Security",
    "Cloud Computing",
    "DevOps",
    "SQL",
    "MongoDB",
    "Mathematics",
    "Presentation Skills",
    "Marketing",
    "Digital Marketing",
    "SEO",
    "Social Media Marketing",
    "Sales",
    "Entrepreneurship",
    "Finance",
    "Accounting",
    "Leadership",
    "Communication",
    "Time Management",
    "Teamwork",
    "Problem Solving",
  ];
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  // update data using useState
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");

  // const [primarySkill, setPrimarySkill] = useState("");
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "https://skillssync-a4r9.onrender.com/api/auth/register",
        { name, email, password, role, qualification, experience, skills, bio },
        { withCredentials: true }
      );

      // ── Mentor application submitted — needs admin approval ──
      if (role === "mentor" || data.mentorPending) {
        setPopupMessage("Application submitted! Waiting for admin approval.");
        setPopupType("success");
        setRedirectPath("/login");
        setPopupOpen(true);
        return;
      }

      // ── Student registered successfully ──
      setUser(data.user);
      localStorage.removeItem("activeRole"); // clear any stale role from previous session
      setPopupMessage("Account created successfully!");
      setPopupType("success");
      setRedirectPath("/dashboard");
      setPopupOpen(true);

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="max-w-md w-108 text-slate-900 dark:text-white ">
        <Link to="/" className="text-sm">
          ← Back to Home
        </Link>
        <span className="flex items-center justify-center mr-0">
          <img
            src={logo}
            alt="logo"
            className="object-cover ml-0 -mr-1 rounded-lg w-14 h-14"
          />

          <span className="text-2xl font-bold">
            <i>Skill</i>
            <span className="font-bold text-transparent bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text">
              <i>Sync</i>
            </span>
          </span>
        </span>

        <h1 className="mt-2 text-2xl font-bold text-center">
          Create Your Account
        </h1>

        <p className="mt-1 mb-5 text-sm text-center text-gray-500 dark:text-slate-400">
          Start your learning journey
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">

          <button type="button"
            onClick={() => setRole("student")}
            className={`rounded-xl border p-3 font-semibold transition
            ${role === "student"
                ? "border-violet-500 bg-violet-600/20 text-violet-400"
                : "border-slate-600 hover:border-violet-500"
              }`}
          >
            👨‍🎓 Student
          </button>

          <button type="button"
            onClick={() => setRole("mentor")}
            className={`rounded-xl border p-3 font-semibold transition
            ${role === "mentor"
                ? "border-cyan-500 bg-cyan-600/20 text-cyan-400"
                : "border-slate-600 hover:border-cyan-500"
              }`}
          >
            👨‍🏫 Mentor
          </button>

        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Full Name
            </label>

            <div className="relative">

              <FiUser className="absolute text-base text-gray-400 -translate-y-1/2 left-4 top-1/2" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-11 pr-4 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D6EFD]"
              />

            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Email Address
            </label>

            <div className="relative">

              <FiMail className="absolute text-base text-gray-400 -translate-y-1/2 left-4 top-1/2" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-11 pr-4 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D6EFD]"
              />

            </div>
          </div>
          {role === "mentor" && (
            <div className="mt-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="BCA, MCA, B.Tech..."
                    className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="2 Years"
                    className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Skills
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, UI Design"
                  className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Bio
                </label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about yourself..."
                  className="w-full p-3 border border-slate-600 rounded-xl bg-slate-800 text-white outline-none resize-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

            </div>
          )}
          <div>

            <label className="block mb-1 text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <FiLock className="absolute text-base text-gray-400 -translate-y-1/2 left-4 top-1/2" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-11 pr-11 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D6EFD]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 -translate-y-1/2 dark:text-gray-400 right-4 top-1/2"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

            </div>
          </div>

          <div>

            <label className="block mb-1 text-sm font-medium">
              Confirm Password
            </label>

            <div className="relative">

              <FiLock className="absolute text-base text-gray-400 -translate-y-1/2 left-4 top-1/2" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 pl-11 pr-11 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0D6EFD]"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute text-gray-500 -translate-y-1/2 dark:text-gray-400 right-4 top-1/2"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 mt-3 font-semibold text-white duration-300 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:scale-105">
            {loading
              ? "Creating Account..."
              : role === "student"
                ? "🚀 Create Student Account"
                : "🚀 Create Mentor Account"}
          </button>

        </form>

        <div className="flex items-center my-4">

          <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>

          <span className="mx-4 text-sm text-gray-500 dark:text-slate-400">
            OR
          </span>

          <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>

        </div>


        <div className="grid grid-cols-2 gap-3">

          <button className="border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm hover:text-white hover:bg-[#0D6EFD] transition">

            <FcGoogle className="text-lg" />

            Google

          </button>

          <button className="border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm hover:bg-[#0D6EFD] hover:text-white transition">

            <FiGithub className="text-lg" />

            GitHub

          </button>

        </div>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-slate-400">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            Sign In
          </Link>

        </p>

      </div>

      {/* ── Single unified popup ── */}
      <Popup
        open={popupOpen}
        message={popupMessage || "Account Created Successfully!"}
        type={popupType}
        onClose={() => {
          setPopupOpen(false);
          if (redirectPath) navigate(redirectPath);
        }}
        onConfirm={() => {
          setPopupOpen(false);
          if (redirectPath) navigate(redirectPath);
        }}
      />
    </>
  );
};

export default CreateAccountForm;

