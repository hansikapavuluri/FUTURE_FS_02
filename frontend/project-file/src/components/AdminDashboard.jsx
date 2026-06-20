import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";
import Analytics from "./Analytics.jsx";
import AddLeadModel from "./AddLeadModel.jsx"; // ✅ import modal component

function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [showModal, setShowModal] = useState(false); // ✅ modal state
  const leadsPerPage = 5;

  // Fetch leads
  const fetchLeads = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please login first.");
      window.location.href = "/login";
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/leads", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const uniqueLeads = res.data.filter(
        (lead, index, self) => index === self.findIndex(l => l._id === lead._id)
      );
      setLeads(uniqueLeads);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const handleStorage = (e) => {
      if (e.key === "newLeadAdded") {
        fetchLeads();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Update status
  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/leads/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  // Add note
  const addNote = async (id, note) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/leads/${id}/notes`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter + Search
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);

  if (loading) return <p className="loading">Loading leads...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">📊 Admin Dashboard</h2>
        <div className="header-actions">
          <button className="btn add" onClick={() => setShowModal(true)}>➕ Add Lead</button>
          <button
            className="btn logout"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Analytics */}
      <Analytics leads={leads} />

      {/* Modal */}
      {showModal && (
        <AddLeadModel
          onAdd={(newLead) => setLeads([...leads, newLead])}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Controls */}
      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Table */}
      <table className="dashboard-table">
        <thead>
          <tr>
            <th onClick={() => requestSort("name")}>Name</th>
            <th onClick={() => requestSort("email")}>Email</th>
            <th onClick={() => requestSort("message")}>Message</th>
            <th onClick={() => requestSort("status")}>Status</th>
            <th>Notes</th>
            <th>Actions</th>
            <th onClick={() => requestSort("createdAt")}>TimeStamps</th>
          </tr>
        </thead>
        <tbody>
          {currentLeads.map(lead => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.message}</td>
              <td><span className={`status ${lead.status}`}>{lead.status}</span></td>
              <td>
                <div className="notes-section">
                  {lead.notes && lead.notes.join(", ")}
                  <input
                    type="text"
                    placeholder="Add note..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim() !== "") {
                        addNote(lead._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </td>
              <td>
                <button className="btn contacted" onClick={() => updateStatus(lead._id, "contacted")}>Contacted</button>
                <button className="btn converted" onClick={() => updateStatus(lead._id, "converted")}>Converted</button>
                <button className="btn delete" onClick={() => deleteLead(lead._id)}>Delete</button>
              </td>
              <td>{new Date(lead.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
