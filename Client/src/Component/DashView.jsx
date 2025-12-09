import React, { useEffect, useState, useMemo } from "react";
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

  // new states for added features
  const [filterType, setFilterType] = useState("all"); // all | debit | credit
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadTransactions = async () => {
    if (!loggedUser?.id) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/transactions/${loggedUser.id}`
      );
      setData(res.data);
            if (!sessionStorage.getItem("transactionsLoaded")) {
        toast.success("Transactions loaded successfully!");
        sessionStorage.setItem("transactionsLoaded", "true");
      }
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

  // SEARCH + FILTER combined (without changing your search logic)
  const filteredData = useMemo(() => {
    const searchFiltered = data.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === "all") return searchFiltered;
    return searchFiltered.filter((item) => item.category_type === filterType);
  }, [data, searchTerm, filterType]);

  // PAGINATION
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // PAGE TOTALS
  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;

    paginatedData.forEach((t) => {
      if (t.category_type === "debit") debit += Number(t.amount || 0);
      if (t.category_type === "credit") credit += Number(t.amount || 0);
    });

    return { debit, credit };
  }, [paginatedData]);

  // PDF DOWNLOAD (kept 100% same logic, only changed data source)
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Transaction Report", 14, 10);

      const rows = paginatedData.map((t, index) => [
        index + 1,
        t.name,
        t.category,
        t.category_type,
        t.amount || "-",
        t.description || "-",
      ]);

      autoTable(doc, {
        head: [["S.No", "Name", "Category", "Type", "Amount", "Description"]],
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

      {/* SEARCH */}
      <input
        type="text"
        className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search transactions by name, category or type..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* FILTER */}
      <select
        value={filterType}
        onChange={(e) => {
          setFilterType(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="all">All</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>

      {loading ? (
        <p className="text-center text-gray-600 py-10">Loading transactions...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-600">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedData.map((t, index) => {
                  const isMatch = filteredData.includes(t);
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
                      <td className="px-4 py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
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

      {/* PAGE TOTALS */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p>
          <strong>Total Debit (this page): </strong>₹{totals.debit}
        </p>
        <p>
          <strong>Total Credit (this page): </strong>₹{totals.credit}
        </p>
      </div>

      {/* PAGINATION BUTTONS */}
      <div className="flex justify-between mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
          Prev
        </button>

        <p className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </p>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* DOWNLOAD PDF BUTTON */}
      <button
        onClick={downloadPDF}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
      >
        Download PDF
      </button>
    </div>
  );
}
