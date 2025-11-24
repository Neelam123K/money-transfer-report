import React, { useEffect, useState } from "react";
import axios from "axios";

const DashForm = () => {
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [amount, setAmount] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState("");

  // Load logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ---------------- LOAD CATEGORIES ----------------
  const loadCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("Category load error:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ---------------- ADD CATEGORY ----------------
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setMessage("Category cannot be empty");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/add-category", {
        category: newCategory,
      });

      setMessage(res.data.message);
      setNewCategory("");
      loadCategories();
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding category");
    }
  };

  // ---------------- ADD TRANSACTION ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !selectedCategory || !categoryType) {
      setMessage("All fields are required");
      return;
    }

    if (!user?.id) {
      setMessage("User not logged in");
      return;
    }

    try {
      await axios.post("http://localhost:5000/add-transaction", {
        name,
        category: selectedCategory,
        category_type: categoryType,
        description,
        image_url: imageUrl,
        amount,
        user_id: user.id, 
      });

      setMessage("Transaction Added Successfully!");

      // Reset all fields
      setName("");
      setDescription("");
      setImageUrl("");
      setAmount("");
      setSelectedCategory("");
      setCategoryType("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding transaction");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* NAME */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Transaction Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* CATEGORY TYPE */}
        <select
          className="w-full border p-2 rounded"
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        {/* CATEGORY DROPDOWN */}
        <select
          className="w-full border p-2 rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.length > 0 ? (
            categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))
          ) : (
            <option disabled>No categories found</option>
          )}
        </select>

        {/* ADD CATEGORY */}
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Create Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* DESCRIPTION */}
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* IMAGE URL */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {/* AMOUNT */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* SUBMIT BUTTON */}
        <button
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold"
          type="submit"
        >
          Add Transaction
        </button>
      </form>

      {/* MESSAGE */}
      {message && (
        <p className="mt-3 text-center text-blue-600 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
};

export default DashForm;
