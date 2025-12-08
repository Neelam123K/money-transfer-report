import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch first 5 user's transactions
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/transactions/${loggedUser?.id}`
      );

      const arr = Array.isArray(res.data) ? res.data : [];
      setTransactions(arr.slice(0, 5)); // FIRST 5 ONLY
    } catch (err) {
      console.log("Error loading transactions:", err);
      setTransactions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="w-[95%] max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">

      {/* Welcome Message */}
      <h2 className="text-3xl font-bold text-green-700 text-center mb-4">
        Welcome, {loggedUser?.name || "User"} 
      </h2>

      <p className="text-center text-gray-600 mb-6">
        Here are your 5 most recent transactions
      </p>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Description</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((t, index) => (
                <tr
                  key={t.id}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} border-b`}
                >
                  <td className="px-4 py-2">{t.name}</td>
                  <td className="px-4 py-2">{t.category}</td>
                  <td className="px-4 py-2">{t.category_type}</td>
                  <td className="px-4 py-2 font-semibold">₹{t.amount}</td>
                  <td className="px-4 py-2">{t.description || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View All Button */}
      <a
        href="/dashview"
        className="block w-full mt-5 text-center bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-medium"
      >
        View All Transactions
      </a>
    </div>
  );
}
