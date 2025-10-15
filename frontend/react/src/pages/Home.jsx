import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenus } from "../services/menu";

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMenus();
        setMenus(data.slice(0, 3)); // แสดงแค่ 3 รายการแรกเป็นเมนูแนะนำ
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-indigo-600 mb-3">🍜 FoodApp</h1>
      <p className="text-gray-700 text-lg mb-8 text-center">
        สั่งอาหารอร่อย ๆ ได้ง่ายในคลิกเดียว!
      </p>

      {/* Section เมนูแนะนำ */}
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          เมนูแนะนำวันนี้
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : menus.length === 0 ? (
          <p className="text-center text-gray-500">
            ยังไม่มีเมนูในระบบตอนนี้ 🍽️
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-indigo-700">
                  {item.name}
                </h3>
                <p className="text-gray-600 mt-1">{item.description}</p>
                <p className="text-green-600 font-bold mt-2">
                  ${item.price?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ปุ่มดูเมนูทั้งหมด */}
      <Link
        to="/menu"
        className="mt-10 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        ดูเมนูทั้งหมด 🍝
      </Link>
    </div>
  );
}
