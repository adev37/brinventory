import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await axios.get(
          "https://brinventorybackend.vercel.app/api/purchase-returns"
        );
        setReturns(res.data);
      } catch (err) {
        console.error("Error fetching purchase returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">
        🔁 Purchase Return List
      </h2>
      {loading ? (
        <p className="text-gray-600">Loading purchase returns...</p>
      ) : returns.length === 0 ? (
        <p className="text-gray-600">No purchase returns found.</p>
      ) : (
        <div className="overflow-x-auto shadow border rounded-lg">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-blue-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">GRN</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Returned Items</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((entry) => (
                <tr key={entry._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {entry._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    {entry.grn
                      ? `GRN #${entry.grn._id.slice(-5).toUpperCase()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {entry.grn?.purchaseOrder?.vendor?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {entry.returnedItems.map((ri, i) => (
                      <div key={i}>
                        {ri.item?.name} — {ri.returnQty}
                        {ri.reason && (
                          <span className="text-gray-500 text-xs">
                            {" "}
                            ({ri.reason})
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturnList;
