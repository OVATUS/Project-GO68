import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMenu } from "../services/menu";

export default function AddMenu() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ถ้าไม่มี token ให้เด้งไป login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    const priceNum = parseFloat(price);
    if (!name.trim() || !description.trim() || isNaN(priceNum) || priceNum <= 0) {
      setErrMsg("กรุณากรอกข้อมูลให้ถูกต้อง ราคา > 0");
      return;
    }

    try {
      setLoading(true);
      await createMenu({ name: name.trim(), description: description.trim(), price: priceNum });
      navigate("/menu");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setErrMsg("โปรดเข้าสู่ระบบอีกครั้ง");
      else if (status === 403) setErrMsg("สำหรับผู้ดูแลระบบเท่านั้น");
      else setErrMsg(err?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มเมนู");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">Add New Menu</h1>

        {errMsg && (
          <div className="mb-4 rounded bg-red-100 text-red-700 px-4 py-2 text-center font-medium">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              rows={4}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Price</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 hover:shadow-lg transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Menu"}
          </button>
        </form>
      </div>
    </div>
  );
}
