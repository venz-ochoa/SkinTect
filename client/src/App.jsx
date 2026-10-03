import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import ConsentModal from "./components/ConsentModal";
import { FooterDisclaimer } from "./components/Disclaimer";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import History from "./pages/History";

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-bg text-text">
        {/* displays the consent modal for cookies and privacy policy, this is a one time thing per user */}
        <ConsentModal />
        <NavBar />
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/signup" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
        </Routes>
        {/* displays the footer disclaimer, this is a one time thing per user */}
        <FooterDisclaimer />
      </div>
    </BrowserRouter>
  );
}