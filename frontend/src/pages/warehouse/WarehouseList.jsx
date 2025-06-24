import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/warehouses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWarehouses(res.data);
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
        toast.error("Error loading warehouses");
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🏢 Warehouses</h2>

      {warehouses.length === 0 ? (
        <p className="text-gray-600">No warehouses found.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Warehouse Name</th>
              <th className="border px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((wh, index) => (
              <tr key={wh._id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{wh.name}</td>
                <td className="border px-4 py-2">{wh.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WarehouseList;
