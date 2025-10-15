import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMenus } from "../../services/menu";
import { createOrder } from "../../services/order";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMenus();
        setMenu(data || []);
      } catch (err) {
        console.error("Load menu failed:", err);
        setError("❌ โหลดเมนูไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
        0
      ),
    [selectedItems]
  );

  const handleItemToggle = (item) => {
    const exists = selectedItems.find((i) => i.id === item.id);
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, qty) => {
    const q = Math.max(1, parseInt(qty || "1", 10));
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedItems.length === 0) {
      setError("กรุณาเลือกอาหารอย่างน้อย 1 รายการ");
      return;
    }

    const itemsPayload = selectedItems.map((i) => ({
      menu_id: i.id,
      quantity: Number(i.quantity || 1),
    }));

    try {
      setPlacing(true);
      await createOrder(itemsPayload);
      navigate("/orders/my");
    } catch (err) {
      console.error("Create order error:", err?.response?.status, err?.response?.data);
      const status = err?.response?.status;
      if (status === 400) setError(err?.response?.data?.message || "ข้อมูลออเดอร์ไม่ถูกต้อง");
      else if (status === 401) setError("โปรดเข้าสู่ระบบอีกครั้ง");
      else setError(err?.response?.data?.message || "สั่งซื้อไม่สำเร็จ");
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-600">กำลังโหลดเมนู...</p>;
  if (error)
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <p className="text-red-600 mb-4 text-center text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          ลองใหม่
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-2xl">
      <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent text-center mb-8">
        🛒 Create Order
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block font-bold text-xl text-gray-800 mb-4">
            เลือกเมนูอาหาร
          </label>
          <div className="max-h-96 overflow-auto p-6 border-2 border-indigo-100 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
            {menu.map((item) => {
              const selected = selectedItems.find((i) => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className="group flex justify-between items-center p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 mb-3 border border-gray-100"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => handleItemToggle(item)}
                      className="w-6 h-6 accent-indigo-600 rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-lg text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {item.name}
                      </span>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    {selected && (
                      <input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-20 h-10 border-2 border-indigo-200 rounded-xl p-2 text-center font-semibold focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    )}
                    <span className="text-indigo-700 font-bold text-lg">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center text-2xl font-black p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
          <span className="text-gray-800">ราคารวมทั้งหมด:</span>
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          type="submit"
          disabled={placing}
          className="w-full py-4 text-xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placing ? "⏳ กำลังสั่งซื้อ..." : "✅ Place Order"}
        </button>
      </form>
    </div>
  );
}