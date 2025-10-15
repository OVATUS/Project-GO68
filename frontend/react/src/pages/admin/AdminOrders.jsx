import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrdersAdmin, adminUpdateOrderStatus } from "../../services/order";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg",
    preparing: "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg",
    done: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg",
    cancelled: "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg",
  };
  const cls = map[status] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg";
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold ${cls} transform scale-95`}>
      {status === "pending" ? "⏳ Pending" : 
       status === "preparing" ? "🔥 Preparing" : 
       status === "done" ? "✅ Done" : 
       status === "cancelled" ? "❌ Cancelled" : status}
    </span>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/");
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllOrdersAdmin();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      setWorkingId(id);
      await adminUpdateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      console.error("Update status error:", e?.response?.status, e?.response?.data);
      alert(e?.response?.data?.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setWorkingId(null);
    }
  };

  const statusOptions = useMemo(() => ["pending", "preparing", "done", "cancelled"], []);

  if (loading) return <p className="p-6 text-center text-gray-600">กำลังโหลด...</p>;
  if (err) return <p className="p-6 text-center text-red-600">{err}</p>;

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent text-center mb-12">
        👑 All Orders (Admin)
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📋</span>
          </div>
          <p className="text-gray-500 text-2xl font-medium">ยังไม่มีออเดอร์</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((o) => (
            <div
              key={o.id}
              className="group bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-indigo-100 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-all duration-300">
                <span className="text-8xl">📦</span>
              </div>
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                  <div className="text-2xl font-black text-indigo-700 flex items-center space-x-3">
                    <span>Order #{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-lg text-gray-500 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>User ID: {o.user_id}</span>
                    <span>• {new Date(o.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
                  <p className="font-bold text-xl text-gray-800 mb-4">Items:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(o.items || []).map((it) => (
                      <li key={it.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <span className="font-medium text-indigo-700">Menu #{it.menu_id}</span>
                        <span className="bg-indigo-100 px-4 py-2 rounded-full text-indigo-700 font-bold">
                          × {it.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-lg text-gray-700 font-semibold">เปลี่ยนสถานะ:</span>
                  <div className="flex flex-wrap gap-3">
                    {statusOptions.map((s) => {
                      const isCurrent = o.status === s;
                      const colorClass = {
                        pending: "from-amber-500 to-orange-500",
                        preparing: "from-sky-500 to-blue-500",
                        done: "from-emerald-500 to-teal-500",
                        cancelled: "from-red-500 to-pink-500",
                      }[s];

                      return (
                        <button
                          key={s}
                          disabled={workingId === o.id || isCurrent}
                          onClick={() => handleUpdate(o.id, s)}
                          className={`group/status px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                            isCurrent 
                              ? "bg-gray-200 text-gray-600 cursor-not-allowed" 
                              : `bg-gradient-to-r ${colorClass} text-white`
                          }`}
                        >
                          <span className="text-sm">
                            {s === "pending" ? "⏳" : 
                             s === "preparing" ? "🔥" : 
                             s === "done" ? "✅" : "❌"}
                          </span>
                          <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}