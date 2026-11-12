import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import HeroVedio from "../assets/bg-HeroClip.mp4"
import aboutImg from "../assets/aboutimg.png"
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import "../components/landing/Navbar"
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

import SkillsParticleCard from "../components/landing/SkillsParticleCard";
import SpecularButton from '../components/landing/SpecularButton';


const Landing = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);
  const [showMore, setShowMore] = useState(false);

  /* ── Dynamic stats from DB ── */
  const [liveStats, setLiveStats] = useState({
    verifiedStudents: null,
    skillsAvailable: null,
    successfulExchanges: null,
    averageRating: null,
  });

  useEffect(() => {
    axios.get("https://skillssync-a4r9.onrender.com/api/public/stats")
      .then((res) => {
        if (res.data.success) setLiveStats(res.data);
      })
      .catch(() => {}); // fail silently on landing page
  }, []);

  /* Format a count as "N+" string, or "—" while loading */
  const fmt = (n) => (n === null ? "..." : `${n}+`);
  const fmtRating = (n) => (n === null ? "..." : `${n}/5`);

  const stats = [
    { icon: "🎓", value: fmt(liveStats.verifiedStudents),   label: "Verified Students"    },
    { icon: "💡", value: fmt(liveStats.skillsAvailable),    label: "Skills Available"     },
    // { icon: "🤝", value: fmt(liveStats.successfulExchanges),label: "Successful Exchanges" },
    // { icon: "⭐", value: fmtRating(liveStats.averageRating),label: "Average Rating"       },
    { icon: "🤝", value: "10+", label: "Successful Exchanges" },
  { icon: "⭐", value: "4.8/5", label: "Average Rating" },
  ];

  /* ── Contact form state ────────────────────────────────────── */
  const [contactName,    setContactName]    = useState("");
  const [contactEmail,   setContactEmail]   = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus,  setContactStatus]  = useState(""); // "" | "success" | "error"
  const [contactError,   setContactError]   = useState("");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (contactLoading) return;
    setContactError("");
    setContactStatus("");
    setContactLoading(true);
    try {
      const res = await axios.post("https://skillssync-a4r9.onrender.com/api/contact", {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });
      if (res.data.success) {
        setContactStatus("success");
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
      }
    } catch (err) {
      setContactStatus("error");
      setContactError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const features = [
    {
      icon: "🔄",
      title: "Skill Exchange",
      desc: "Trade your knowledge instead of paying money. Teach React, learn Photoshop.",
    },
    {
      icon: "🎓",
      title: "Students Only",
      desc: "A community built exclusively for college students, verified by college email.",
    },
    {
      icon: "⭐",
      title: "Ratings & Reviews",
      desc: "Build your reputation with honest reviews after every exchange.",
    },
    {
      icon: "🔍",
      title: "Smart Browse",
      desc: "Search and filter students by skill category, college, or department.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create Your Profile",
      desc: "Add your skills, bio, and what you want to learn.",
    },
    {
      step: "2",
      title: "Browse & Connect",
      desc: "Find students who teach what you want to learn.",
    },
    {
      step: "3",
      title: "Send a Request",
      desc: "Offer one of your skills in exchange for theirs.",
    },
    {
      step: "4",
      title: "Learn & Rate",
      desc: "Complete the exchange and rate each other.",
    },
  ];

  const stories = [
    {
      name: "Priya S.",
      college: "BCA, Mumbai University",
      quote:
        "Traded my Photoshop skills for React lessons. Landed my first internship!",
    },
    {
      name: "Rahul M.",
      college: "B.Tech CSE, Pune",
      quote:
        "Learned video editing from a senior in exchange for teaching Python basics.",
    },
    {
      name: "Ananya K.",
      college: "BCA, Surat",
      quote:
        "Best way to learn without spending money. Made great friends too.",
    },
  ];


  const faqs = [
    {
      question: "Is SkillExchange free to use?",
      answer: "Yes. SkillExchange is completely free for college students.",
    },
    {
      question: "Who can join SkillExchange?",
      answer:
        "Only verified college students can register and exchange skills.",
    },
    {
      question: "Can I learn more than one skill?",
      answer:
        "Yes. You can connect with multiple students and learn different skills.",
    },
    {
      question: "How do skill exchanges work?",
      answer:
        "Students teach each other without paying money. You exchange one skill for another.",
    },
  ];

  const skills = [
    { name: "React", icon: "⚛️" },
    { name: "Python", icon: "🐍" },
    { name: "Figma", icon: "🎨" },
    { name: "Video Editing", icon: "🎬" },
    { name: "UI/UX", icon: "🎯" },
    { name: "Node.js", icon: "💻" },
    // { name: "+ More", icon: "" }
  ];

  const extraSkills = [
    { name: "Java", icon: "☕" },
    { name: "JavaScript", icon: "🟨" },
    { name: "MongoDB", icon: "🍃" },
    { name: "Express.js", icon: "🚀" },
    { name: "Flutter", icon: "📱" },
    { name: "C++", icon: "💻" },
    { name: "Photoshop", icon: "🖌️" },
    { name: "Excel", icon: "📊" },
    { name: "Graphic Design", icon: "🎨" },
    { name: "HTML", icon: "🌐" },
    { name: "CSS", icon: "🎭" },
    { name: "Tailwind CSS", icon: "💨" },
    { name: "React Native", icon: "📲" },
    { name: "Node.js", icon: "🖥️" },
    { name: "Git", icon: "🔀" },
    { name: "GitHub", icon: "🐙" },
    { name: "Video Editing", icon: "🎬" },
  ];

  function ChevronIcon({ open }) {
    return (
      <svg
        className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 
          ${open ? "rotate-180 text-cyan-400" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }



  return (
    <div className="min-h-screen transition-colors duration-300 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Navbar />
      {/* Hero Section */}
      <section id="Hero" className="relative h-screen overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 object-cover w-full">
          <source src={HeroVedio} type="video/mp4" />

        </video>
         <div className="absolute inset-0 bg-slate-900/65"></div>
         
         
        <div className="relative z-10 flex items-center justify-center h-full px-4 text-center">
          <div className="max-w-6xl mx-auto">

            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-900/50 text-blue-300 text-sm font-medium mb-6">
              For College Students, By College Students
            </span>

            <h1 className="mb-6 text-4xl font-bold leading-tight  md:text-6xl" style={{ color: "#fff" }}>
              Trade Skills,{" "}
              <span className="text-transparent bg-linear-to-r from-violet-500 to-cyan-500 bg-clip-text">
                Not Money
              </span>
            </h1>

            <p className="max-w-2xl mx-auto mb-8 text-lg text-slate-300">
              Exchange knowledge with fellow students. Teach what you know, learn what
              you don't — all without spending a single rupee.
            </p>

            <div className="flex justify-center gap-4">
              <Link to="/register" className="px-6 py-3 font-bold text-white transition shadow-lg rounded-xl bg-linear-to-r from-violet-500 to-cyan-500 hover:opacity-80"
              >  Get Started Free   </Link>

              <Link to="/login" className="px-6 py-3 font-semibold text-white transition border border-white/200 hover:bg-white/20 rounded-xl"
              >  I Already Have an Account   </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="p-20 mx-auto">

        <h2 className="mb-12 text-3xl font-bold text-center">
          Why SkillExchange?
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((f) => (

            <div
              key={f.title}
              className="p-6 text-center transition-transform bg-white border shadow-xl rounded-4xl border-slate-200 hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700"
            >

              <div className="mb-3 text-4xl">
                {f.icon}
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                {f.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {f.desc}
              </p>

            </div>

          ))}

        </div>
      </section>

      {/* popular skilss */}
      <section id="skills" className="py-22 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Popular Skills on <span className="text-purple-500">SkillSync</span>
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Explore the most exchanged skills on our platform.
        </p>

        {/* HORIZONTAL CHIPS GRID */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto px-4">
          {skills.map((skill, index) => (
            <SkillsParticleCard
              key={index}
              /* Dark Glassmorphism + Glow border styling */
              className="px-6 py-3 rounded-2xl bg-white dark:bg-[#120F17]/80 backdrop-blur-md border border-purple-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              glowColor="147, 51, 234" /* Purple particle glow */
              particleCount={10}
              enableTilt={true}
              enableMagnetism={true}
            >
              <div className="flex items-center gap-2 text-white font-medium text-base">
                {skill.icon && <span>{skill.icon}</span>}
                <span className="flex items-center gap-2 font-medium text-base text-slate-900 dark:text-white">{skill.name}</span>
              </div>
            </SkillsParticleCard>
          ))}

          {showMore && extraSkills.map((skill, idx) =>
            <SkillsParticleCard
              key={`extra-${idx}`}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-[#120F17]/80 backdrop-blur-md border border-purple-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              glowColor="147, 51, 234"
              particleCount={10}
              enableTilt={true}
              enableMagnetism={true}
            >
              <div className="flex items-center gap-2 text-white font-medium text-base">
                {skill.icon && <span>{skill.icon}</span>}
                <span className="flex items-center gap-2 font-medium text-base text-slate-900 dark:text-white">{skill.name}</span>
              </div>
            </SkillsParticleCard>
          )}
          <SkillsParticleCard
            onClick={() => setShowMore(!showMore)}
            className="cursor-pointer px-6 py-3 rounded-2xl bg-white dark:bg-[#120F17]/80 backdrop-blur-md border border-purple-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all duration-300"
            glowColor="147, 51, 234"
            particleCount={10}
            enableTilt
            enableMagnetism
          >
            <div className="flex items-center gap-2 text-white font-medium text-base">
              <span className="flex items-center gap-2 font-medium text-base text-slate-900 dark:text-white">{showMore ? "➖" : "➕"}</span>
              <span className="flex items-center gap-2 font-medium text-base text-slate-900 dark:text-white">{showMore ? "Less" : "More"}</span>
            </div>
          </SkillsParticleCard>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl px-4 py-20 mx-auto">

        <h2 className="mb-12 text-3xl font-bold text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {steps.map((s) => (

            <div key={s.step} className="text-center">

              <div className="flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white rounded-full w-14 h-14 bg-linear-to-r from-violet-500 to-cyan-500">
                {s.step}
              </div>

              <h3 className="mb-2 font-semibold">
                {s.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {s.desc}
              </p>

            </div>

          ))}

        </div>
      </section>

      {/* about us */}
      <section id="about" className="relative py-20 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"  >
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-70 dark:opacity-100 bg-[radial-gradient(circle_at_top,#7c3aed15,transparent_35%),radial-gradient(circle_at_bottom,#06b6d415,transparent_35%)] dark:bg-[radial-gradient(circle_at_top,#7c3aed22,transparent_35%),radial-gradient(circle_at_bottom,#06b6d422,transparent_35%)]"></div>

        <div className="relative z-10 grid items-center max-w-6xl gap-16 px-6 mx-auto lg:grid-cols-2">

          {/* IMAGE */}
          <div className="order-1 flex justify-center lg:order-2">
            <img
              src={aboutImg}
              alt="About SkillSync"
              className="w-full max-w-lg transition duration-500 hover:scale-105"
            />
          </div>

          {/* CONTENT */}
          <div className="order-2 lg:order-1">

            <span className="inline-flex px-4 py-2 mb-5 text-sm font-semibold text-cyan-600 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/20 rounded-full bg-cyan-100 dark:bg-cyan-500/10">
              ABOUT SKILLSYNC
            </span>

            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Learn.
              <span className="text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text">
                {" "}Teach.{" "}
              </span>
              Grow Together.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              SkillSync is a student-first learning platform where college students
              exchange skills, collaborate on projects, connect with mentors, and
              grow together without spending money.
            </p>

            {/* Features */}

            <div className="grid gap-6 mt-10">

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-violet-100 dark:bg-violet-500/10">
                  🎓
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Learn from Students
                  </h4>

                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Discover talented students ready to teach practical, real-world skills.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-cyan-100 dark:bg-cyan-500/10">
                  🤝
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Exchange Knowledge
                  </h4>

                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Teach what you know while learning new skills from others.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl bg-amber-100 dark:bg-amber-500/10">
                  🏆
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Build Your Portfolio
                  </h4>

                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Earn ratings, badges, Skill Coins and valuable project experience.
                  </p>
                </div>
              </div>

            </div>

            <Link to="/register" className="inline-block mt-7 dark:text-blue-500">
              <SpecularButton
                size="md"
                radius={18}
                tint={isDark ? "#ffffff" : "#000000"}
                tintOpacity={0}
                blur={0}
                textColor={isDark ? "#f5f5f5" : "#1f2937"} /* White text in dark mode, dark gray in light mode */
                lineColor={isDark ? "#ffffff" : "rgba(0, 0, 0, 0.2)"} /* White border in dark mode, subtle gray in light mode */
                baseColor={isDark ? "#525252" : "rgba(255, 255, 255, 0.6)"} /* Your original dark base, semi-transparent white for light mode */
                intensity={1}
                shineSize={30}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
              >
                Join SkillSync →
              </SpecularButton>


            </Link>

          </div>

        </div>
      </section>

      {/* staticstics */}
      <section className="px-6 py-20 ">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            Platform Statistics
          </h2>
          <p className="mb-12 text-base text-slate-400 md:text-lg">
            Our growing student community is exchanging knowledge every day.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 backdrop-blur-sm border border-slate-200 dark:border-slate-700
glow-box rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1.5"   >
                <div className="mb-4 text-4xl">{stat.icon}</div>
                <div className="mb-2 text-3xl font-extrabold text-transparent md:text-4xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Student Success Stories */}
      <section className="max-w-6xl px-4 py-16 mx-auto" id="success-story">

        <h2 className="mb-12 text-3xl font-bold text-center">
          Student Success Stories
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {stories.map((s) => (

            <div
              key={s.name}
              className="p-6 bg-white border shadow-lg rounded-4xl border-slate-200 dark:bg-slate-800 dark:border-slate-700"
            >

              <p className="mb-4 italic text-slate-600 dark:text-slate-300">
                "{s.quote}"
              </p>

              <p className="font-semibold">
                {s.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {s.college}
              </p>

            </div>

          ))}

        </div>
      </section>

      {/* FAQ */}
      <section id="FAQ" className="px-6 py-20 ">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mb-12 text-base text-slate-400 md:text-lg">
            Everything you need to know before exchanging skills.
          </p>

          <div className="flex flex-col gap-4 text-left">
            {faqs.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={i}
                  className="
overflow-hidden
transition-colors duration-300
border
bg-white dark:bg-slate-900
border-slate-200 dark:border-slate-700/50
rounded-2xl
hover:border-violet-500/45
"
                >
                  <button
                    onClick={() => toggle(i)}
                    className="flex items-center justify-between w-full gap-4 px-6 py-5 text-left"
                  >
                    <span  className="text-base font-semibold text-slate-900 dark:text-white md:text-lg">
                      {faq.question}
                    </span>
                    <ChevronIcon open={open} />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ================= CONTACT ================= */}

      <section
        id="contact"
        className="relative py-24 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-70 dark:opacity-100 bg-[radial-gradient(circle_at_top,#7c3aed15,transparent_35%),radial-gradient(circle_at_bottom,#06b6d415,transparent_35%)] dark:bg-[radial-gradient(circle_at_top,#7c3aed22,transparent_35%),radial-gradient(circle_at_bottom,#06b6d422,transparent_35%)]"></div>

        <div className="relative z-10 max-w-3xl px-6 mx-auto">

          {/* Heading */}
          <div className="mb-12 text-center">

            <span className="inline-flex px-4 py-2 mb-5 text-sm font-semibold text-cyan-600 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/20 rounded-full bg-cyan-100 dark:bg-cyan-500/10">
              CONTACT US
            </span>

            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Let's Build Something Amazing
            </h2>

            <p className="max-w-2xl mx-auto mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Have a question, feedback, or partnership idea? We'd love to hear from
              you. Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleContactSubmit}
            className="p-8 rounded-3xl border border-slate-200 dark:border-white/10
      bg-white dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-none
      space-y-5 transition-colors duration-300"
          >

            <div className="grid gap-5 md:grid-cols-2">

              <input
                type="text"
                placeholder="Your Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl
          bg-slate-50 dark:bg-slate-900/70
          border border-slate-300 dark:border-slate-700
          text-slate-900 dark:text-white
          placeholder:text-slate-400
          outline-none
          transition
          focus:border-violet-500
          focus:ring-2 focus:ring-violet-500/20"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl
          bg-slate-50 dark:bg-slate-900/70
          border border-slate-300 dark:border-slate-700
          text-slate-900 dark:text-white
          placeholder:text-slate-400
          outline-none
          transition
          focus:border-violet-500
          focus:ring-2 focus:ring-violet-500/20"
              />

            </div>

            <input
              type="text"
              placeholder="Subject"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-xl
        bg-slate-50 dark:bg-slate-900/70
        border border-slate-300 dark:border-slate-700
        text-slate-900 dark:text-white
        placeholder:text-slate-400
        outline-none
        transition
        focus:border-violet-500
        focus:ring-2 focus:ring-violet-500/20"
            />

            {/* textarea — Enter creates new line, does NOT submit */}
            <textarea
              rows="6"
              placeholder="Write your message..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
              className="w-full px-5 py-4 rounded-xl resize-none
        bg-slate-50 dark:bg-slate-900/70
        border border-slate-300 dark:border-slate-700
        text-slate-900 dark:text-white
        placeholder:text-slate-400
        outline-none
        transition
        focus:border-violet-500
        focus:ring-2 focus:ring-violet-500/20"
            ></textarea>

            {/* Inline success message */}
            {contactStatus === "success" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {/* Inline error message */}
            {contactStatus === "error" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                ⚠️ {contactError}
              </div>
            )}

            <button
              type="submit"
              disabled={contactLoading}
              className="w-full py-4 font-semibold text-white rounded-xl
        bg-gradient-to-r from-violet-600 to-cyan-500
        hover:scale-[1.02] hover:shadow-xl
        transition duration-300
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {contactLoading ? "Sending..." : "Send Message →"}
            </button>

          </form>

        </div>
      </section>


      {/* CTA Section */}
      <section className="bg-white py-15 dark:bg-slate-900">
        <div className="max-w-4xl px-6 mx-auto">

          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 p-6 md:py-10 px-7 shadow-[0_0_40px_rgba(34,211,238,.2)]">

            <div className="grid items-center md:grid-cols-2">

              {/* Left */}

              <div>
                <div className="mb-5 text-5xl">
                  🚀
                </div>

                <h2 className="text-3xl font-bold text-white">
                  Ready to Start
                  <br />
                  Exchanging Skills?
                </h2>

                <p className="mt-5 text-lg text-white/80">
                  Join thousands of students already learning from each other.
                </p>

                <Link to="/register" className="inline-block mt-5 " >
                  < SpecularButton
                    size="md"
                    radius={18}

                    tintOpacity={0}
                    blur={0}

                    intensity={1}
                    shineSize={30}
                    shineFade={40}
                    thickness={1}
                    speed={0.35}
                    followMouse
                    proximity={250}
                    autoAnimate={false}
                  >
                    Join SkillSync →
                  </SpecularButton>
                </Link>

              </div>

              {/* Right */}

              <div className="justify-center hidden md:flex">

                <div className="text-[150px]">
                  🎓
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
