import React, { useEffect, useState } from "react";
import axios from "axios";

const DeliveryChallanList = () => {
  const [challans, setChallans] = useState([]);

  useEffect(() => {
    axios
      .get("https://brinventorybackend.vercel.app/api/delivery-challans")
      .then((res) => setChallans(res.data || []))
      .catch((err) => console.error("Error loading challans:", err));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📦 Delivery Challans</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Client</th>
              <th className="border px-4 py-2 text-left">Items</th>
              <th className="border px-4 py-2 text-left">Transport</th>
              <th className="border px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {challans.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No delivery challans found.
                </td>
              </tr>
            ) : (
              challans.map((dc) => (
                <tr key={dc._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    {dc.client?.name || "Unnamed Client"}
                  </td>
                  <td className="border px-4 py-2">
                    <ul className="list-disc list-inside">
                      {dc.items.map((i, index) => (
                        <li key={index}>
                          {i.item?.name || "Unknown Item"} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border px-4 py-2">
                    {dc.transportDetails || "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {dc.createdAt
                      ? new Date(dc.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryChallanList;
