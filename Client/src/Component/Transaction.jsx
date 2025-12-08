import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;

    if (!userId) {
      alert("User ID not found. Please login again.");
      return;
    }

    axios
      .get(`http://localhost:5000/transactions/${userId}`)
      .then((res) => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <h2 className="text-center text-xl font-semibold mt-10">
        Loading...
      </h2>
    );
  }

  return (
    <div className="w-11/12 md:w-3/4 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        Your Transactions
      </h2>

      {transactions.length === 0 ? (
        <h3 className="text-center text-gray-500 text-lg">
          No transactions found
        </h3>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold border-b">ID</th>
                <th className="px-4 py-3 text-left font-semibold border-b">Amount</th>
                <th className="px-4 py-3 text-left font-semibold border-b">Description</th>
                <th className="px-4 py-3 text-left font-semibold border-b">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 border-b">{t.id}</td>
                  <td className="px-4 py-3 border-b font-medium">
                    ₹{t.amount}
                  </td>
                  <td className="px-4 py-3 border-b">{t.description}</td>
                  <td className="px-4 py-3 border-b">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
