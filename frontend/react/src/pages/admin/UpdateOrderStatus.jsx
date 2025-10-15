import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminUpdateOrderStatus, getAllOrdersAdmin } from "../../services/order";

export default function UpdateOrderStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/");
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getAllOrdersAdmin();
        const found = Array.isArray(data) ? data.find((o) => String(o.id) === String(id)) : null;
        if (found?.status && mounted) setStatus(found.status);
      } catch (e) {
        console.warn("Prefill status failed:", e?.response?.status, e?.response?.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    try {
      setSaving(true);
      await adminUpdateOrderStatus(id, status);
      navigate("/admin/orders");
    } catch (e) {
      console.error("Update status error:", e?.response?.status, e?.response?.data);
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 401) setErrMsg("โปรดเข้าสู่ระบบอีกครั้ง");
      else if (e?.response?.status === 403) setErrMsg("สำหรับผู้ดูแลระบบเท่านั้น");
      else if (e?.response?.status === 404) setErrMsg("ไม่พบออเดอร์นี้");
      else setErrMsg(msg || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">กำลังโหลด...</p>;

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent text-center mb-2">
        👑 Update Order #{id}
      </h1>
      <p className="text-center text-gray-600 mb-8 font-medium">Admin Panel</p>

      {errMsg && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-sm">
          <p className="text-red-700 font-semibold text-center">❌ {errMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold text-xl text-gray-800 mb-3">
            Select New Status
          </label>
          <select
            className="w-full h-14 border-2 border-indigo-200 rounded-2xl p-4 text-lg font-semibold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 bg-gradient-to-r from-indigo-50 to-purple-50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="pending">⏳ Pending</option>
            <option value="preparing">🔥 Preparing</option>
            <option value="done">✅ Done</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 text-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <span>⏳</span>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Update Status</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}