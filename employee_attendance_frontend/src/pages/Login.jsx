import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'; // Optional: Your custom styles

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/accounts/login/', form);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container-fluid login-page">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4 col-sm-10">
          <div className="card p-4 shadow-lg rounded-4">
            <h2 className="text-center mb-4"><b>Welcome Back</b></h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary rounded-pill">
                  Login
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <small className="text-muted">Don't have an account? <a href="/register">Register</a></small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
