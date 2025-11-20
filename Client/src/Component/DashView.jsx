import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashView() {
  const [data, setData] = useState([]);

  const loadTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/transactions");
      setData(res.data);
    } catch (err) {
      console.log("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction Report", 14, 10);

    const rows = data.map((t) => [
      t.id,
      t.name,
      t.category,
      t.category_type,
      t.amount || "-",
      t.description || "-",
      t.image_url || "-",
    ]);

    autoTable(doc, {
      head: [["ID", "Name", "Category", "Type", "Amount", "Description", "Image URL"]],
      body: rows,
      startY: 20,
    });

    doc.save("transaction_report.pdf");
  };

  return (
    <div className="w-[95%] max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">All Transactions</h2>

      {data.length === 0 ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        data.map((t) => (
          <div
            key={t.id}
            className="border border-gray-300 bg-gray-100 p-4 rounded-lg mb-4"
          >
            <h3 className="text-xl font-semibold">{t.name}</h3>
            <p><span className="font-bold">Category:</span> {t.category}</p>
            <p><span className="font-bold">Type:</span> {t.category_type}</p>
            <p><span className="font-bold">Amount:</span> ₹{t.amount || "—"}</p>
            <p><span className="font-bold">Description:</span> {t.description}</p>

            {t.image_url && (
              <img
                src={t.image_url}
                alt=""
                className="w-32 h-32 object-cover mt-2 rounded"
              />
            )}
          </div>
        ))
      )}

      <button
        onClick={downloadPDF}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium cursor-pointer"
      >
        Download PDF
      </button>
    </div>
  );
}
