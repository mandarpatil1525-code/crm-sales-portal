import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = { companyName: "", contactName: "", email: "", phone: "", source: "website" };

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLeads = async () => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await api.get("/leads", { params });
    setLeads(res.data);
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await api.post("/leads", form);
    setMessage(res.data.duplicateWarning ? "Lead created (possible duplicate detected)" : "Lead created");
    setForm(emptyForm);
    setShowForm(false);
    fetchLeads();
  };

  const handleStatusChange = async (id, newStatus) => {
    await api.put(`/leads/${id}`, { status: newStatus });
    fetchLeads();
  };

  const handleConvert = async (id) => {
    const dealValue = prompt("Estimated deal value ($)?", "1000");
    if (dealValue === null) return;
    await api.post(`/leads/${id}/convert`, { dealValue: Number(dealValue) });
    fetchLeads();
  };

  const handleExport = () => {
    window.open(`${api.defaults.baseURL}/leads/export/csv`, "_blank");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700"
          >
            {showForm ? "Cancel" : "New Lead"}
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">{message}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 grid grid-cols-2 gap-3">
          <input
            placeholder="Company name"
            className="border rounded-md px-3 py-2"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
          <input
            placeholder="Contact name"
            className="border rounded-md px-3 py-2"
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            className="border rounded-md px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            className="border rounded-md px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="border rounded-md px-3 py-2 col-span-2"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="cold_call">Cold call</option>
            <option value="social_media">Social media</option>
            <option value="event">Event</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
          <button className="col-span-2 bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700">
            Save lead
          </button>
        </form>
      )}

      <div className="flex gap-3">
        <input
          placeholder="Search leads..."
          className="border rounded-md px-3 py-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="unqualified">Unqualified</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned to</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-t">
                <td className="p-3">{lead.companyName}</td>
                <td className="p-3">{lead.contactName}</td>
                <td className="p-3">{lead.source}</td>
                <td className="p-3">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className="border rounded-md px-2 py-1 text-xs"
                    disabled={lead.status === "converted"}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="unqualified">Unqualified</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
                <td className="p-3">{lead.assignedTo?.name}</td>
                <td className="p-3">
                  {lead.status !== "converted" && (
                    <button
                      onClick={() => handleConvert(lead._id)}
                      className="text-indigo-600 text-xs hover:underline"
                    >
                      Convert
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
