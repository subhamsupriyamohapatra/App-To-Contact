import React, { useState } from "react";
import toast from "react-hot-toast";

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    purpose: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
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
            value={form.name}
            placeholder="Your Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            value={form.email}
            placeholder="Your Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            value={form.purpose}
            placeholder="Purpose"
            onChange={(e) =>
              setForm({ ...form, purpose: e.target.value })
            }
          />

          <textarea
            value={form.description}
            placeholder="Description"
            rows="4"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}