// src/components/ListTeam.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function ListTeam() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [permission, setPermission] = useState({});
  const [coverletter, setCoverLetter] = useState({});
  const [profile, setProfile] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [breakStart, setBreakStart] = useState(null);
  const [breakEnd, setBreakEnd] = useState(null);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);

  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);


  useEffect(() => {
  // Count present and absent from attendance object
  const presentCount = Object.values(attendance).filter(
    (status) => status?.toLowerCase() === "present"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (status) => status?.toLowerCase() === "absent"
  ).length;

  setPresentDays(presentCount);
  setAbsentDays(absentCount);
}, [attendance]);


  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://127.0.0.1:8000/api/employees/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Employee load error:", err));

    axios
      .get("http://127.0.0.1:8000/api/accounts/profile/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => {
        window.location.href = "/login";
      });

    setCurrentDateTime(new Date().toLocaleString());
  }, []);

  const handleFieldChange = (setter, id, value) => {
    const strId = String(id);
    setter((prev) => ({ ...prev, [strId]: value }));
  };

  const handleDelete = (id) => {
    const strId = String(id);
    setEmployees((prev) => prev.filter((emp) => String(emp.id) !== strId));
    handleFieldChange(setAttendance, strId, undefined);
    handleFieldChange(setPermission, strId, undefined);
    handleFieldChange(setCoverLetter, strId, undefined);
  };

  const applyBulk = (setter, value) => {
    const updated = {};
    employees.forEach((emp) => {
      updated[String(emp.id)] = value;
    });
    setter(updated);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const today = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
      .replace(" ", "T")
      .split("T")[0];

    if (!profile?.username) {
      alert("User profile not loaded.");
      return;
    }

    const loggedInEmployee = employees.find(
      (emp) => emp.username === profile.username
    );

    if (!loggedInEmployee) {
      alert("Employee ID not found in employees list.");
      return;
    }

    const empId = String(loggedInEmployee.id);

    const userAttendance = {
      employee_id: loggedInEmployee.id,
      name: profile.username,
      status: (attendance[empId] || "").toLowerCase(),
      position: profile.position || "",
      permission_type: permission[empId] || "",
      reason: coverletter[empId] || "",
      is_self: true,
      date: today,
      punch_in: punchInTime,
      punch_out: punchOutTime,
      break_start: breakStart,
      break_end: breakEnd,
    };

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/accounts/attendance/save/",
        { records: [userAttendance] },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Attendance saved successfully!");
    } catch (err) {
      alert(
        "Error submitting attendance: " +
          JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  // Load saved data when page loads
useEffect(() => {
  setPunchInTime(localStorage.getItem('punchInTime') || null);
  setPunchOutTime(localStorage.getItem('punchOutTime') || null);
  setBreakStart(localStorage.getItem('breakStart') || null);
  setBreakEnd(localStorage.getItem('breakEnd') || null);

  const savedAttendance = localStorage.getItem('attendance');
  const savedPermission = localStorage.getItem('permission');
  const savedCoverLetter = localStorage.getItem('coverletter');

  if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
  if (savedPermission) setPermission(JSON.parse(savedPermission));
  if (savedCoverLetter) setCoverLetter(JSON.parse(savedCoverLetter));
}, []);

// Save each time state changes
useEffect(() => {
  localStorage.setItem('punchInTime', punchInTime || '');
}, [punchInTime]);

useEffect(() => {
  localStorage.setItem('punchOutTime', punchOutTime || '');
}, [punchOutTime]);

useEffect(() => {
  localStorage.setItem('breakStart', breakStart || '');
}, [breakStart]);

useEffect(() => {
  localStorage.setItem('breakEnd', breakEnd || '');
}, [breakEnd]);

useEffect(() => {
  localStorage.setItem('attendance', JSON.stringify(attendance));
}, [attendance]);

useEffect(() => {
  localStorage.setItem('permission', JSON.stringify(permission));
}, [permission]);

useEffect(() => {
  localStorage.setItem('coverletter', JSON.stringify(coverletter));
}, [coverletter]);


  return (
    <div className="container-fluid p-4 team-container">
      {profile && (
        <div className="card mb-4 shadow-sm p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <img
                src={profile.image}
                alt={profile.username}
                className="rounded-circle"
                width="60"
                height="60"
              />
              <div>
                <h5 className="mb-1">{profile.username}</h5>
                <small className="text-muted">
                  {profile.position} | ID: {profile.employee_id}
                </small>
                <br />
                <button
                  className="btn btn-outline-danger btn-sm mt-1"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="text-end">
              <small>{currentDateTime}</small>
              <p className="mb-0">
                <strong>Present:</strong> {presentDays} |{" "}
                <strong>Absent:</strong> {absentDays}
              </p>
              <p className="mb-0">
                <strong>Salary:</strong> ₹10,000 |{" "}
                <strong>This Month:</strong> ₹7,000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Punch Buttons */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className="btn btn-success"
          onClick={() =>
            setPunchInTime(
              new Date()
                .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
                .replace(" ", "T")
            )
          }
        >
          Punch In
        </button>
        <button
          className="btn btn-warning"
          onClick={() =>
            setPunchOutTime(
              new Date()
                .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
                .replace(" ", "T")
            )
          }
        >
          Punch Out
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() =>
            setBreakStart(
              new Date()
                .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
                .replace(" ", "T")
            )
          }
        >
          Start Break
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() =>
            setBreakEnd(
              new Date()
                .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
                .replace(" ", "T")
            )
          }
        >
          End Break
        </button>
      </div>

      {/* Punch Info */}
      <div className="mb-4">
  <p>
    <strong>Punch In:</strong>{" "}
    <span style={{ color: punchInTime ? "green" : "red" }}>
      {punchInTime || "—"}
    </span>{" "}
    |{" "}
    <strong>Punch Out:</strong>{" "}
    <span style={{ color: punchOutTime ? "green" : "red" }}>
      {punchOutTime || "—"}
    </span>
  </p>

  <p>
    <strong>Break:</strong>{" "}
    <span style={{ color: breakStart ? "orange" : "#666" }}>
      {breakStart
        ? `Start: ${new Date(breakStart).toLocaleTimeString()}`
        : "—"}
    </span>{" "}
    <span style={{ color: breakEnd ? "orange" : "#666" }}>
      {breakEnd
        ? `End: ${new Date(breakEnd).toLocaleTimeString()}`
        : "—"}
    </span>
  </p>
</div>


      {/* Attendance Controls */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <select
          className="form-select"
          onChange={(e) => applyBulk(setAttendance, e.target.value)}
        >
          <option value="">-- Set All Attendance --</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Break">Break</option>
        </select>

        <select
          className="form-select"
          onChange={(e) => applyBulk(setPermission, e.target.value)}
        >
          <option value="">-- Set All Permission --</option>
          <option value="WFH">WFH</option>
          <option value="Half Day">Half Day</option>
          <option value="Permission">Permission</option>
        </select>

        {profile && ["WFH", "Half Day", "Permission"].includes(permission[profile.id]) && (
          <input
            type="text"
            className="form-control"
            value={coverletter[String(profile.id)] || ""}
            onChange={(e) =>
              handleFieldChange(setCoverLetter, profile.id, e.target.value)
            }
            placeholder="Reason"
          />
        )}

        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit Attendance
        </button>
      </div>

      {/* Table */}
      {profile && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Permission</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{profile.username}</td>
                <td>
                  <select
                    className="form-select"
                    value={attendance[String(profile.id)] || ""}
                    onChange={(e) =>
                      handleFieldChange(setAttendance, profile.id, e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Break">Break</option>
                  </select>
                </td>
                <td>
                  <select
                    className="form-select"
                    value={permission[String(profile.id)] || ""}
                    onChange={(e) =>
                      handleFieldChange(setPermission, profile.id, e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="WFH">WFH</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Permission">Permission</option>
                  </select>
                </td>
                <td>
                  {["WFH", "Half Day", "Permission"].includes(
                    permission[profile.id]
                  ) && (
                    <input
                      type="text"
                      className="form-control"
                      value={coverletter[String(profile.id)] || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          setCoverLetter,
                          String(profile.id),
                          e.target.value
                        )
                      }
                      placeholder="Reason"
                    />
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(profile.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
