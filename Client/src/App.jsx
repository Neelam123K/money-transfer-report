import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./Component/Register";
import Login from "./Component/Login";
import DashForm from "./Component/DashForm";
import Transaction from "./Component/Transaction";
import DashView from "./Component/DashView";
import Dashboard from "./Component/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <Router>
      {/* Toast */}
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="min-h-screen bg-gray-100">

        {/* NAVBAR */}
        <nav className="bg-blue-700 text-white py-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center px-6">
            <Link to="/" className="text-xl font-semibold hover:text-yellow-300">
              Money Transaction Report
            </Link>

            <div className="space-x-4 text-lg">
              {!isLoggedIn && (
                <>
                  <Link className="hover:text-yellow-300" to="/register">Register</Link>
                  <Link className="hover:text-yellow-300" to="/login">Login</Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  <Link className="hover:text-yellow-300" to="/dashform">Add Transaction</Link>
                  <Link className="hover:text-yellow-300" to="/dashview">View Transactions</Link>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-300 ml-3"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ROUTES */}
        <div className="container mx-auto mt-10 px-4">
          <Routes>
            {/* Default route */}
            <Route
              path="/"
              element={isLoggedIn ? <Dashboard /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route path="/register" element={<Register />} />

            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route
              path="/dashform"
              element={isLoggedIn ? <DashForm /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route
              path="/transaction"
              element={isLoggedIn ? <Transaction /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />

            <Route
              path="/dashview"
              element={isLoggedIn ? <DashView /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<h2 className="text-center text-2xl">404 - Page Not Found</h2>}
            />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;