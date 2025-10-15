import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../../services/order";

function StatusBadge({ status }) {
  const map = {
    pending: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg",
    cancelled: "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg",
    done: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg",
  };
  const cls = map[status] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg";
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-bold ${cls} transform scale-95`}>
      {status === "pending" ? "⏳ Pending" : 
       status === "cancelled" ? "❌ Cancelled" : 
       status === "done" ? "✅ Done" : status}
    </span>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data || []);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("ต้องการยกเลิกออเดอร์นี้หรือไม่?")) return;
    try {
      setWorkingId(id);
      await cancelOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))
      );
    } catch (e) {
      console.error("Cancel error:", e?.response?.status, e?.response?.data);
      const s = e?.response?.status;
      if (s === 400) alert(e?.response?.data?.message || "ยกเลิกไม่ได้ในสถานะปัจจุบัน");
      else if (s === 401) alert("โปรดเข้าสู่ระบบอีกครั้ง");
      else if (s === 403) alert("ไม่ใช่เจ้าของออเดอร์นี้");
      else if (s === 404) alert("ไม่พบออเดอร์");
      else alert("ยกเลิกออเดอร์ไม่สำเร็จ");
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-600">กำลังโหลด...</p>;
  if (err) return <p className="p-6 text-center text-red-600">{err}</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent text-center mb-12">
        📦 My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📦</span>
          </div>
          <p className="text-gray-500 text-2xl font-medium">ยังไม่มีออเดอร์</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="group bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-indigo-100 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-all duration-300">
                <span className="text-8xl">📋</span>
              </div>
              
              <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  <p className="font-black text-2xl text-indigo-700 mb-3">
                    Order #{o.id}
                  </p>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-gray-600 font-semibold text-lg">Status:</span>
                    <StatusBadge status={o.status} />
                  </div>

                  <div className="bg-indigo-50 rounded-2xl p-4">
                    <ul className="space-y-2 text-gray-700">
                      {(o.items || []).map((it) => (
                        <li key={it.id} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                          <span className="font-medium">Menu #{it.menu_id}</span>
                          <span className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-bold">
                            × {it.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {o.status === "pending" && (
                  <button
                    onClick={() => handleCancel(o.id)}
                    disabled={workingId === o.id}
                    className="group/cancel self-start lg:self-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:from-red-600 hover:to-red-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {workingId === o.id ? (
                      <>
                        <span>⏳</span>
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <span>❌</span>
                        <span>Cancel</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}