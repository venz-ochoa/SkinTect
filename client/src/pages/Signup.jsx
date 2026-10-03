import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import FormField from "../components/FormField";
import Button from "../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for sign up
export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); // null | "loading" | "done" | { error }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    //this is where we use the signup thing we made in server.js
    //everything is the same in login.jsx (the explanation i mean)
    //refer there, everything here is the same, most of the difference is found in server.js
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setStatus("done");
      //when user successfully signs up, it sends them to the login page
      window.location = "/login";
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  //claude generated UI
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create your account</h1>

      <Card>
        {status === "done" ? (
          <p>Account created. You can log in now.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <FormField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-primary mt-1 hover:underline"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
            <Button type="submit" variant="primary" disabled={status === "loading"}>
              {status === "loading" ? "Signing up..." : "Sign up"}
            </Button>
            {status?.error && <p className="text-malignant">{status.error}</p>}
            <p className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-bold">
                Log in
              </Link>
            </p>
          </form>
        )}
      </Card>
    </main>
  );
}