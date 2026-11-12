import React, { useEffect, useState } from "react";

import {
  RiCodeBoxLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCloseLine,
  RiFireLine,
  RiEditLine
} from "react-icons/ri";

import axios from "axios";

import "../../styles/Admin/AdminSkills.css";


const AdminSkills = () => {

  const [skills, setSkills] = useState([]);
  const [editingSkill, setEditingSkill] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    description: "",
    level: "Beginner",
    // icon: "",
  });


  // =========================================================
  // FETCH SKILLS
  // =========================================================

  const fetchSkills = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        "https://skillssync-a4r9.onrender.com/api/skills"
      );

      if (response.data.success) {

        setSkills(response.data.skills);

      }

    } catch (error) {

      console.error("Fetch Skills Error:", error);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchSkills();

  }, []);


  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "All",
    ...new Set(
      skills
        .map((skill) => skill.category)
        .filter(Boolean)
    ),
  ];


  // =========================================================
  // FILTER
  // =========================================================

  const filteredSkills = skills.filter((skill) => {

    const matchesSearch =
      skill.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      skill.category === category;

    return matchesSearch && matchesCategory;

  });


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================================================
  // ADD SKILL
  // =========================================================

  const handleAddSkill = async (e) => {

    e.preventDefault();

    if (!formData.name.trim()) {

      alert("Please enter skill name.");

      return;

    }

    if (!formData.category.trim()) {

      alert("Please enter category.");

      return;

    }


    try {

      setSaving(true);


      const response = await axios.post(
        "https://skillssync-a4r9.onrender.com/api/skills",
        {
          name: formData.name.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          level: formData.level,
          // icon: formData.icon.trim(),
        }
      );


      if (response.data.success) {

        alert("Skill added successfully!");

        setShowModal(false);


        setFormData({
          name: "",
          category: "Programming",
          description: "",
          level: "Beginner",
          // icon: "",
        });


        fetchSkills();

      }

    } catch (error) {

      console.error("Add Skill Error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to add skill."
      );

    } finally {

      setSaving(false);

    }

  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);

    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description,
      level: skill.level,
    });

    setShowModal(true);
  };
  // =========================================================
  // DELETE SKILL
  // =========================================================

  const handleDelete = async (id) => {
    console.log(id);
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `https://skillssync-a4r9.onrender.com/api/skills/${id}`
      );

      setSkills((prev) =>
        prev.filter((skill) => skill._id !== id)
      );

    } catch (error) {

      console.log(error);

      alert("Failed to delete skill");

    }

  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    console.log("editingSkill:", editingSkill);
    console.log("formData:", formData);
    try {
      setSaving(true);

      const response = await axios.put(
        `https://skillssync-a4r9.onrender.com/api/skills/${editingSkill._id}`,
        formData
      );

      if (response.data.success) {
        alert("Skill updated successfully");

        setEditingSkill(null);

        setShowModal(false);

        fetchSkills();
      }
    } catch (error) {
      console.log(error);
      alert("Failed to update skill");
    } finally {
      setSaving(false);
    }
  };
  return (

    <div className="admin-skills-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="skills-page-header">

        <div>

          <h1>
            <RiCodeBoxLine />
            Skills Management
          </h1>

          <p>
            {skills.length} skills in platform
          </p>

        </div>


        <button
          className="add-skill-btn"
          onClick={() => setShowModal(true)}
        >

          <RiAddLine />

          Add Skill

        </button>

      </div>



      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="skills-filters">


        <div className="skill-search">

          <RiSearchLine />

          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          {categories.map((item) => (

            <option
              key={item}
              value={item}
            >

              {item === "All"
                ? "All Categories"
                : item}

            </option>

          ))}

        </select>


      </div>



      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="skills-table-wrapper">

        <table className="skills-table">


          <thead>

            <tr>

              <th>SKILL</th>

              <th>CATEGORY</th>

              <th>LEVEL</th>

              <th>STATUS</th>

              <th>ACTIONS</th>

            </tr>

          </thead>


          <tbody>


            {loading ? (

              <tr>

                <td
                  colSpan="5"
                  className="no-skills"
                >

                  Loading skills...

                </td>

              </tr>

            ) : filteredSkills.length > 0 ? (

              filteredSkills.map((skill) => (

                <tr key={skill._id}>


                  {/* Skill */}

                  <td>

                    <div className="skill-name-cell">

                      {/* <span className="skill-icon">

                        {skill.icon || "💡"}

                      </span> */}


                      <strong>
                        {skill.name}
                      </strong>

                    </div>

                  </td>


                  {/* Category */}

                  <td>

                    <span className="category-badge">

                      {skill.category}

                    </span>

                  </td>


                  {/* Level */}

                  <td>

                    <span className="category-badge">

                      {skill.level || "Beginner"}

                    </span>

                  </td>


                  {/* Status */}

                  <td>

                    {skill.isActive ? (

                      <span className="trend-badge growing">

                        <RiFireLine />

                        Active

                      </span>

                    ) : (

                      <span className="not-trending">

                        Inactive

                      </span>

                    )}

                  </td>


                  {/* Actions */}

                  <td>

                    <div className="skill-actions">
                      <button
                        className="edit-skill-btn"
                        onClick={() => handleEdit(skill)}
                        title="Edit"
                      >
                        <RiEditLine />
                      </button>
                      <button
                        className="delete-skill-btn"
                        onClick={() =>
                          handleDelete(skill._id)
                        }
                        title="Delete"
                      >

                        <RiDeleteBinLine />

                      </button>

                    </div>

                  </td>


                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="5"
                  className="no-skills"
                >

                  No skills found.

                </td>

              </tr>

            )}


          </tbody>

        </table>

      </div>



      {/* =====================================================
          ADD SKILL MODAL
      ===================================================== */}

      {showModal && (

        <div className="skill-modal-overlay">


          <div className="skill-modal">


            {/* Modal Header */}

            <div className="skill-modal-header">

              <div>

                <h2>
                  Add New Skill
                </h2>

                <p>
                  Add a skill to the platform
                </p>

              </div>


              <button
                type="button"
                className="skill-modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >

                <RiCloseLine />

              </button>

            </div>



            {/* Form */}

            <form
              className="skill-form"
              onSubmit={editingSkill ? handleUpdateSkill : handleAddSkill}
            >


              {/* Name */}

              <div className="skill-form-group">

                <label>
                  Skill Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. React.js"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>



              {/* Category */}

              <div className="skill-form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="Programming">
                    Programming
                  </option>

                  <option value="Design">
                    Design
                  </option>

                  <option value="Marketing">
                    Marketing
                  </option>

                  <option value="Data Science">
                    Data Science
                  </option>




                  <option value="Language">
                    Language
                  </option>



                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* Description */}

              <div className="skill-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe this skill..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />

              </div>



              {/* Level */}

              <div className="skill-form-group">

                <label>
                  Level
                </label>

                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >

                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>

                </select>

              </div>

              {/* Buttons */}

              <div className="skill-form-actions">

                <button
                  type="button"
                  className="skill-cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="skill-submit-btn"
                  disabled={saving}
                >
                  {saving
                    ? (editingSkill ? "Updating..." : "Adding...")
                    : (editingSkill ? "Update Skill" : "Add Skill")}
                </button>

              </div>


            </form>


          </div>

        </div>

      )}


    </div>

  );

};


export default AdminSkills;
