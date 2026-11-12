import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Student/BrowseSkills.css"
import { FiVideo } from "react-icons/fi";
import {
    FiSearch,
    FiUsers,
    FiArrowRight,
} from "react-icons/fi";

import {
    SiJavascript,
    SiReact,
    SiNodedotjs,
    SiPython,
    SiFigma,
    // SiAdobepremierepro,
} from "react-icons/si";

import {
    RiPaletteLine,
    RiMegaphoneLine,
    RiBarChartLine,
} from "react-icons/ri";


// const skillsData = [
//     {
//         id: 1,
//         name: "JavaScript",
//         category: "Programming",
//         mentors: 24,
//         icon: SiJavascript,
//         accent: "yellow",
//     },
//     {
//         id: 2,
//         name: "React.js",
//         category: "Programming",
//         mentors: 18,
//         icon: SiReact,
//         accent: "cyan",
//     },
//     {
//         id: 3,
//         name: "Node.js",
//         category: "Programming",
//         mentors: 15,
//         icon: SiNodedotjs,
//         accent: "green",
//     },
//     {
//         id: 4,
//         name: "Python",
//         category: "Programming",
//         mentors: 21,
//         icon: SiPython,
//         accent: "orange",
//     },
//     {
//         id: 5,
//         name: "UI/UX Design",
//         category: "Design",
//         mentors: 12,
//         icon: RiPaletteLine,
//         accent: "pink",
//     },
//     {
//         id: 6,
//         name: "Figma",
//         category: "Design",
//         mentors: 9,
//         icon: SiFigma,
//         accent: "purple",
//     },
//     {
//         id: 7,
//         name: "Video Editing",
//         category: "Creative",
//         mentors: 11,
//         icon:  FiVideo,
//         accent: "cyan",
//     },
//     {
//         id: 8,
//         name: "Digital Marketing",
//         category: "Marketing",
//         mentors: 8,
//         icon: RiMegaphoneLine,
//         accent: "pink",
//     },
//     {
//         id: 9,
//         name: "Data Science",
//         category: "Data Science",
//         mentors: 14,
//         icon: RiBarChartLine,
//         accent: "purple",
//     },
//     {
//         id: 10,
//         name: "Machine Learning",
//         category: "Data Science",
//         mentors: 10,
//         icon: RiBarChartLine,
//         accent: "cyan",
//     },
//     {
//         id: 11,
//         name: "Photography",
//         category: "Creative",
//         mentors: 7,
//         icon: RiPaletteLine,
//         accent: "pink",
//     },
//     {
//         id: 12,
//         name: "English Speaking",
//         category: "Soft Skills",
//         mentors: 16,
//         icon: RiPaletteLine,
//         accent: "purple",
//     },
// ];

const skillIcons = {
  "React.js": "⚛️",
  "Node.js": "🟢",
  "JavaScript": "⚡",
  "Python": "🐍",
  "Machine Learning": "🤖",
};
const categories = [
    "All",
    "Programming",
    "Design",
    "Marketing",
    "Data Science",
    "Creative",
    "Soft Skills",
];


const SkillCard = ({ skill, onFindMentors }) => {

    const Icon = skill.icon;

    return (
        <div className={`skill-card skill-card-${skill.accent}`}>

            {/* Decorative dots */}
            <div className="skill-card-dots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Background glow */}
            <div className="skill-card-glow"></div>

            {/* Icon */}
            <div className="skill-icon-box">
                <Icon className="skill-icon" />
            </div>

            {/* Content */}
            <div className="skill-card-content">

                <h3>{skill.name}</h3>

                <span className="skill-category">
                    {skill.category}
                </span>

                <div className="skill-card-bottom">

                    <div className="mentor-count">
                        <FiUsers />
                        <span>{skill.mentors} mentors</span>
                    </div>

                    <button
                        type="button"
                        className="find-mentor-btn"
                        onClick={() => onFindMentors(skill)}
                    >
                        <span>Find Mentors</span>
                        <FiArrowRight />
                    </button>

                </div>

            </div>

        </div>
    );
};


const BrowseSkills = () => {

    const navigate = useNavigate();

    const [skillsData, setSkillsData] = useState([]);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "https://skillssync-a4r9.onrender.com/api/skills"
                );

                if (response.data.success) {
                    const formattedSkills = response.data.skills.map((skill) => {
                        // Use skill.name as icon key (skillIcons maps by name)
                        const emoji = skillIcons[skill.name];

                        return {
                            ...skill,
                            id: skill._id,
                            mentors: skill.mentors ?? 0,  // real count from backend
                            accent: "cyan",
                            // If we have a react-icon component use it, else fallback
                            icon: emoji ? () => <span style={{ fontSize: "1.5rem" }}>{emoji}</span> : RiPaletteLine,
                        };
                    });
                    setSkillsData(formattedSkills);
                }
            } catch (error) {
                console.error("Fetch Skills Error:", error);
                setError("Failed to load skills.");
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);


    const filteredSkills = useMemo(() => {

        return skillsData.filter((skill) => {

            const matchesSearch =
                skill.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                skill.category
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                activeCategory === "All" ||
                skill.category === activeCategory;

            return matchesSearch && matchesCategory;

        });

    }, [skillsData, activeCategory,activeCategory]);


    const handleFindMentors = (skill) => {
        navigate(`/find-mentors?skill=${encodeURIComponent(skill.name)}`);
    };


    return (
        <div className="browse-skills-page">

            {/* Header */}
            <section className="browse-hero">

                <div>
                    <h1>
                        Browse <span>Skills</span>
                    </h1>

                    <p>
                        Explore skills taught by the SkillSync community
                        and find students who can help you learn.
                    </p>
                </div>

                <div className="skills-count">
                    <FiUsers />
                    <span>{skillsData.length} Skills</span>
                </div>

                {/* Search */}
                <div className="skills-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search skills..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </section>


            {/* Categories */}
            <div className="skill-categories">

                {categories.map((category) => (

                    <button
                        key={category}
                        type="button"
                        className={
                            activeCategory === category
                                ? "category-btn active"
                                : "category-btn"
                        }
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>

                ))}

            </div>


            {/* Result count */}
            <div className="skills-result">

                Showing <strong>{filteredSkills.length}</strong> skills

            </div>


            {/* Cards */}
            <div className="skills-grid">

                {loading ? (

                    <div className="no-skills">
                        <h3>Loading skills...</h3>
                    </div>

                ) : error ? (

                    <div className="no-skills">
                        <h3>{error}</h3>
                    </div>

                ) : filteredSkills.length > 0 ? (

                    filteredSkills.map((skill) => (

                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            onFindMentors={handleFindMentors}
                        />

                    ))

                ) : (

                    <div className="no-skills">

                        <FiSearch />

                        <h3>No skills found</h3>

                        <p>
                            Try searching for another skill.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
};


export default BrowseSkills;
