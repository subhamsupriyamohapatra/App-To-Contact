import React, { useState } from "react";
import toast from "react-hot-toast";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/contact"
    : "https://app-to-contact.vercel.app/api/contact";

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    purpose: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully 🚀");
        setForm({
          name: "",
          email: "",
          purpose: "",
          description: "",
        });
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="wrapper">
      <div className="card">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <select
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
          >
            <option value="">Select Purpose</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Support">Support</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Your Message"
            value={form.description}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
