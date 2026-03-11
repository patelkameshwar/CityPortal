import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockLogin } from "./mockApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await mockLogin(email, password);
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token); // optional: save token
      navigate("/"); // redirect to homepage
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12"></div>

      <div className="flex-1 flex items-center justify-start lg:justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-center mb-4">
            <h2 className="text-3xl font-semibold text-center text-gray-900">
              Login
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-blue-500 placeholder-gray-400"
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:opacity-90 transition"
            >
              Login
            </button>

            {message && (
              <p className="text-center text-red-500 mt-2">{message}</p>
            )}

            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Signup now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
