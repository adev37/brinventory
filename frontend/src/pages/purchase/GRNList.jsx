import React, { useEffect, useState } from "react";
import axios from "axios";

const GRNList = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRNs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/goods-receipts"); // ✅ Corrected route
        setGrns(res.data);
      } catch (error) {
        console.error("Error fetching GRNs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGRNs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">
        📥 Goods Receipt Notes (GRN)
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading GRNs...</p>
      ) : grns.length === 0 ? (
        <p className="text-gray-600">No GRNs found.</p>
      ) : (
        <div className="overflow-x-auto shadow border rounded-lg">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-blue-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">GRN ID</th>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Received Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {grns.map((grn) => (
                <tr key={grn._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    GRN-{grn._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    {grn.purchaseOrder?.poNumber || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {grn.purchaseOrder?.vendor?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(grn.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        grn.purchaseOrder?.status === "Received"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {grn.purchaseOrder?.status || "Pending"}
                    </span>
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

export default GRNList;
