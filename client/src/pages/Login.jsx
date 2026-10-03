import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import FormField from "../components/FormField";
import Button from "../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 
//this is for the user login page
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); //null | "loading" | "done" | { error }
    
  //defaults to loading
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
    //this is where we use the fetch api made in server.js
        const res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setStatus("done");
        //when user successfully logs in, it sends them to the home page
        window.location = "/";
    } catch (err) {
      setStatus({ error: err.message });
    }
  }
 
  //claude generated front UI
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>
      <Card>
        {status === "done" ? (
          <p>Logged in.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              {status === "loading" ? "Logging in..." : "Log in"}
            </Button>
            {status?.error && <p className="text-malignant">{status.error}</p>}
            <p className="text-center text-sm mt-2">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </form>
        )}
      </Card>
    </main>
  );
}
 
