  import { useState } from "react";
  import axios from "axios";
  import "../../styles/Student/BecomeMentor.css";

  const BecomeMentor = () => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      skills: "",
      experience: "",
      qualification: "",
      teachingMode: "Online",
      language: "English",
      portfolio: "",
      linkedin: "",
      bio: "",
    });

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const res = await axios.post(
          "https://skillssync-a4r9.onrender.com/api/mentor/apply",
          {
            ...formData,
            skills: formData.skills
              .split(",")
              .map((item) => item.trim()),
          },
          {
            withCredentials: true,
          }
        );

        alert(res.data.message);

        setFormData({
          skills: "",
          experience: "",
          qualification: "",
          teachingMode: "Online",
          language: "English",
          portfolio: "",
          linkedin: "",
          bio: "",
        });
      } catch (error) {
        console.log(error);
        alert(
          error?.response?.data?.message ||
            "Application Failed"
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="mentor-page">
        <div className="mentor-header">
          <h1>Become a Mentor</h1>
          <p>
            Share your skills and help others learn.
          </p>
        </div>

        <form
          className="mentor-form"
          onSubmit={handleSubmit}
        >
          <div className="mentor-card">
            <h3>Skills & Expertise</h3>

            <div className="form-group">
              <label>Skills</label>
              <input
                type="text"
                name="skills"
                placeholder="React, Node.js, MongoDB"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Experience</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="2 Years"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="BCA"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mentor-card">
            <h3>Teaching Preferences</h3>

            <div className="grid-2">
              <div className="form-group">
                <label>Teaching Mode</label>

                <select
                  name="teachingMode"
                  value={formData.teachingMode}
                  onChange={handleChange}
                >
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Both</option>
                </select>
              </div>

              <div className="form-group">
                <label>Language</label>

                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mentor-card">
            <h3>Additional Information</h3>

            <div className="grid-2">
              <div className="form-group">
                <label>Portfolio Link</label>
                <input
                  type="url"
                  name="portfolio"
                  placeholder="https://portfolio.com"
                  value={formData.portfolio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>LinkedIn Link</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>

              <textarea
                rows="6"
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mentor-note">
            Your application will be reviewed by
            admin before approval.
          </div>

          <button
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>
      </div>
    );
  };

  export default BecomeMentor;
