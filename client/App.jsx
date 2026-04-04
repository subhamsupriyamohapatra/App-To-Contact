
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/contact"
    : "https://app-to-contact-f58x.vercel.app/api/contact";

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