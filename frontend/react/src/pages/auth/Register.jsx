// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../../services/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", role: "member" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.username.trim() || !form.password.trim()) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      await registerApi({
        username: form.username.trim(),
        password: form.password.trim(),
        role: form.role, // member | admin
      });
      setMessage("✅ สมัครสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ…");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 409) setMessage("❌ ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว");
      else if (status === 400) setMessage("⚠️ ข้อมูลไม่ถูกต้อง");
      else setMessage(msg || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">
          สมัครสมาชิก
        </h2>

        {message && (
          <p className="text-center mb-3 text-sm text-red-500">{message}</p>
        )}

        <label className="block mb-2 text-gray-700">Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4"
          disabled={loading}
        />

        <label className="block mb-2 text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4"
          disabled={loading}
        />

        <label className="block mb-2 text-gray-700">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-6"
          disabled={loading}
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
      </form>
    </div>
  );
}
