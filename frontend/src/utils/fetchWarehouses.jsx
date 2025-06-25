// utils/fetchWarehouses.js
import axios from "axios";

export const fetchWarehouses = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://brinventorybackend.vercel.app/api/warehouses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("❌ Error fetching warehouses:", err.response || err);
    throw err; // propagate so it can show toast in caller
  }
};
