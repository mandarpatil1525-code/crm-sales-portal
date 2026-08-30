import { useEffect, useState } from "react";
import api from "../api/axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityForm, setActivityForm] = useState({ type: "note", summary: "", nextFollowUpDate: "" });

  const fetchCustomers = async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomer = async (customer) => {
    const res = await api.get(`/customers/${customer._id}`);
    setSelected(res.data.customer);
    setActivities(res.data.activities);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    await api.post("/activities", { customer: selected._id, ...activityForm });
    setActivityForm({ type: "note", summary: "", nextFollowUpDate: "" });
    openCustomer(selected);
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <div className="col-span-1 bg-white border rounded-lg overflow-hidden h-fit">
        <p className="p-3 font-semibold border-b bg-gray-50 text-sm">Customers</p>
        {customers.map((c) => (
          <button
            key={c._id}
            onClick={() => openCustomer(c)}
            className={`w-full text-left p-3 border-b hover:bg-gray-50 text-sm ${
              selected?._id === c._id ? "bg-indigo-50" : ""
            }`}
          >
            <p className="font-medium">{c.companyName}</p>
            <p className="text-gray-500 text-xs">{c.contactName}</p>
          </button>
        ))}
        {customers.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No customers yet. Convert a qualified lead to create one.</p>
        )}
      </div>

      <div className="col-span-2">
        {!selected ? (
          <p className="text-gray-400 text-sm">Select a customer to view details</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-lg font-semibold">{selected.companyName}</h2>
              <p className="text-sm text-gray-500">{selected.contactName} · {selected.email} · {selected.phone}</p>
              {selected.notes && <p className="text-sm mt-2 text-gray-600">{selected.notes}</p>}
            </div>

            <form onSubmit={handleAddActivity} className="bg-white border rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold">Log an interaction</p>
              <select
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={activityForm.type}
                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
              >
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
              </select>
              <textarea
                placeholder="Summary"
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={activityForm.summary}
                onChange={(e) => setActivityForm({ ...activityForm, summary: e.target.value })}
                required
              />
              <label className="block text-xs text-gray-500">Next follow-up date</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={activityForm.nextFollowUpDate}
                onChange={(e) => setActivityForm({ ...activityForm, nextFollowUpDate: e.target.value })}
              />
              <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700">
                Add activity
              </button>
            </form>

            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm font-semibold mb-3">Interaction history</p>
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a._id} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-xs text-gray-400 uppercase">{a.type}</p>
                    <p className="text-sm">{a.summary}</p>
                    {a.nextFollowUpDate && (
                      <p className="text-xs text-gray-500">
                        Follow up: {new Date(a.nextFollowUpDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">by {a.createdBy?.name}</p>
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-gray-400">No activity logged yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
