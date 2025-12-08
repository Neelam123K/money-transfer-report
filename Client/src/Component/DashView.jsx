import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashView() {
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/transactions/${loggedUser?.id}`
      );
      setData(res.data);
      toast.success("Transactions loaded successfully!");
    } catch (err) {
      console.log("Error fetching transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const completeLogin = async () => {
      if (loggedUser?.first_login_done) return;
      try {
        await axios.put(
          `http://localhost:5000/first-login-update/${loggedUser?.id}`
        );
        toast.success("Login completed!");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...loggedUser, first_login_done: true })
        );
      } catch (error) {
        console.log("Error completing first login:", error);
        toast.error("Error completing login");
      }
    };

    completeLogin();
    loadTransactions();
  }, []);

  const filteredData = data.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Transaction Report", 14, 10);

      const rows = filteredData.map((t) => [
        t.id,
        t.name,
        t.category,
        t.category_type,
        t.amount || "-",
        t.description || "-",
      ]);

      autoTable(doc, {
        head: [["ID", "Name", "Category", "Type", "Amount", "Description"]],
        body: rows,
        startY: 20,
      });

      doc.save("transaction_report.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Error generating PDF");
    }
  };

  return (
    <div className="w-[95%] max-w-5xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="text-center text-2xl font-bold mb-6 text-blue-700">
        All Transactions
      </h2>

      <input
        type="text"
        className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search transactions by name, category or type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p className="text-center text-gray-600 py-10">Loading transactions...</p>
      ) : (
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
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-600">
                    No transactions found
                  </td>
                </tr>
              ) : (
                data.map((t, index) => {
                  const isMatch = filteredData.includes(t); // Highlight if matches search
                  return (
                    <tr
                      key={t.id}
                      className={`border-b ${
                        isMatch
                          ? "bg-yellow-100 font-semibold"
                          : index % 2 === 0
                          ? "bg-gray-100"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-2">{t.name}</td>
                      <td className="px-4 py-2">{t.category}</td>
                      <td className="px-4 py-2">{t.category_type}</td>
                      <td className="px-4 py-2 font-semibold">₹{t.amount}</td>
                      <td className="px-4 py-2">{t.description || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={downloadPDF}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
      >
        Download PDF
      </button>
    </div>
  );
}
