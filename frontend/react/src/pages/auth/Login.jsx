import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../../services/auth";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password.trim()) {
      setError("⚠️ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      const { data } = await loginApi(form.username.trim(), form.password.trim());
      // backend ส่ง { token, role }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // นำทางตามบทบาท
      if (data.role === "admin") {
        navigate("/admin/orders");
      } else {
        navigate("/orders/my");
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) setError("❌ Username หรือ Password ไม่ถูกต้อง");
      else if (status === 400) setError("⚠️ ข้อมูลไม่ถูกต้อง");
      else setError(msg || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">
          เข้าสู่ระบบ
        </h2>

        {error && <p className="text-center mb-3 text-sm text-red-500">{error}</p>}

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
          className="w-full p-2 border rounded-md mb-6"
          disabled={loading}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}
