// import { useState } from "react";
// import { useMutation } from "@apollo/client";
// import { LOGIN_MUTATION } from "../graphql/mutation"; // Adjust path as needed

// function Login({ setToken, setUser }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loginUser, { data, loading, error }] = useMutation(LOGIN_MUTATION);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Trigger the mutation with email and password variables
//       const response = await loginUser({
//         variables: { email, password },
//       });

//       const token = response.data?.loginUser?.token;
//       const user = response.data?.loginUser?.user;

//       if (token && user) {
//         setToken(token);
//         setUser(user);
//         localStorage.setItem("token", token);  // Save token in localStorage
//         localStorage.setItem("user", JSON.stringify(user)); // Save user data in localStorage
//       } else {
//         console.error("No token or user returned");
//       }
//     } catch (err) {
//       console.error("Login error", err);
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
//       {data && <p>Login successful!</p>}
//     </div>
//   );
// }

// export default Login;

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/mutation"; // Adjust path as needed

function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Trigger the mutation with email and password variables
      const response = await loginUser({
        variables: { email, password },
      });

      const token = response.data?.loginUser?.token;
      const user = response.data?.loginUser?.user;

      if (token && user) {
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);  // Save token in localStorage
        localStorage.setItem("user", JSON.stringify(user)); // Save user data in localStorage
      } else {
        console.error("No token or user returned");
      }
    } catch (err) {
      console.error("Login error", err);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">Error: {error.message}</p>}
      {data && <p className="success-message">Login successful!</p>}
    </div>
  );
}

export default Login;

const style = `
  .login-container {
    background-color: #F0F9F4; /* Icy Mint */
    font-family: 'Arial', sans-serif;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    margin: 0 auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    color: #333;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .input-field {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
  }

  .submit-button {
    padding: 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .submit-button:hover {
    background-color: #45a049;
  }

  .submit-button:disabled {
    background-color: #9E9E9E;
    cursor: not-allowed;
  }

  .error-message {
    color: red;
    text-align: center;
  }

  .success-message {
    color: green;
    text-align: center;
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);