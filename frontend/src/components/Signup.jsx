import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER_MUTATION } from "../graphql/mutation.jsx";
import { useNavigate } from "react-router-dom";

function Signup({ setToken, setUser }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // Default role
  const [department, setDepartment] = useState("");

  const [createUser, { loading, error }] = useMutation(CREATE_USER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting mutation...", { name, email, password, role, department }); // Debugging log

      const response = await createUser({ 
        variables: { name, email, password, role, department } 
      });

      console.log("GraphQL Response:", response); // Log response

      const token = response.data?.createUser?.token;
      const user = response.data?.createUser?.user;

      if (token && user) {
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Signup successful!");
        navigate("/dashboard"); // Redirect to dashboard after signup
      } else {
        console.error("No token or user returned");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="STUDENT">STUDENT</option>
          <option value="HOD">HOD</option>
          <option value="STAFF">STAFF</option>
        </select>
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      
      {/* Back button to go to Login page */}
      <button onClick={() => navigate("/")}>Back to Login</button>
    </div>
  );
}

export default Signup;
