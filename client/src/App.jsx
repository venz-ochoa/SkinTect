import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for routing purposes, each screen has its own file. this is for readability and easy debugging
export default function App() {
  //undefined means we are still checking the backend, 'null' means not logged in.
  const [user, setUser] = useState(undefined);

  //this is for checking if the user is logged in or not, and then setting the user state accordingly
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  //show a blank screen or loading text for a split second while verifying the session
  if (user === undefined) {
    return <div className="min-h-screen bg-bg text-text p-4">Loading...</div>;
  }

//haha routes, similar to dart.. i miss dart..
 return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg text-text">
        <NavBar />
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/signup" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}