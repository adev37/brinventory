import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseOrderList = () => {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/purchase-orders")
      .then((res) => {
        // ✅ Ensure it's an array
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.poList || [];
        setPoList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch purchase orders:", err);
        setPoList([]); // prevent .map crash
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-white max-w-5xl mx-auto shadow rounded">
      <h2 className="text-xl font-bold mb-4">📋 Purchase Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {poList.length === 0 ? (
            <p>No purchase orders found.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2 border">PO Number</th>
                  <th className="px-4 py-2 border">Vendor</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {poList.map((po) => (
                  <tr key={po._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{po.poNumber}</td>
                    <td className="px-4 py-2 border">
                      {po.vendor?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">{po.status}</td>
                    <td className="px-4 py-2 border">
                      {po.deliveryDate?.slice(0, 10) || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default PurchaseOrderList;
