import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Select from 'react-select';

// Position options array
const positionOptions = [
  { value: 'Management', label: 'Management' },
  { value: 'SPI', label: 'SPI' },
  { value: 'OCR', label: 'OCR' },
  { value: 'Trainers', label: 'Trainers' },
  { value: 'Json', label: 'Json' },
  { value: 'HQ', label: 'HQ' },
  { value: 'HQ_Trainess', label: 'HQ_Trainess' },
  { value: 'E_Pub', label: 'E_Pub' },
  { value: 'XML_Team', label: 'XML_TEAM' },
  { value: 'XML&APDF', label: 'XML&APDF' },
  { value: 'XML(SPI)_Team', label: 'XML(SPI)_TEAM' },
  { value: 'XML_Trainees', label: 'XML_Trainees' },
  { value: 'APDF_Team', label: 'APDF_Team' },
  { value: 'APDF_Trainees', label: 'APDF_Trainees' },
  { value: 'Spanish_Team', label: 'Spanish_Team' },
  { value: 'Spanish_Trainees', label: 'Spanish_Trainees' },
  { value: 'Development', label: 'Development' },
];

// Optional: Custom styles for scroll height
const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: '150px',
    overflowY: 'auto',
  }),
};

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    position: '',
    employee_id: '',
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    if (image) formData.append('image', image);

    try {
      await axios.post('http://127.0.0.1:8000/api/accounts/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      alert(
        'Registration failed: ' +
          JSON.stringify(error.response?.data || error.message)
      );
    }
  };

  return (
    <div className="register-container container register-page">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5 col-sm-10">
          <div className="register-card p-4 shadow rounded-4">
            <h2 className="text-center mb-4">Create Account</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
    <label className="form-label">Position</label>
    <Select
      className="form-select"
      styles={customStyles}
      options={positionOptions}
      value={positionOptions.find(opt => opt.value === form.position)}
      onChange={(selected) =>
        setForm({ ...form, position: selected?.value || '' })
      }
      isSearchable
      placeholder="Select Position"
    />
  </div>
              <div className="mb-4">
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                  required
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary rounded-pill">
                  Register
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <small className="text-muted">
                Already have an account? <Link to="/login">Login</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
