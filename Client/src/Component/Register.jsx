import axios from "axios";
import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.post("http://localhost:5000/register", form);

    console.log(res.data);
    alert("Registered Successfully");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/20 backdrop-blur-lg shadow-xl rounded-xl p-8 border border-white/30"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Create Account
        </h2>

        <div className="mb-4">
          <label className="text-white font-medium">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="mb-4">
          <label className="text-white font-medium">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="mb-4">
          <label className="text-white font-medium">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-blue-600 font-semibold py-2 mt-4 rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
