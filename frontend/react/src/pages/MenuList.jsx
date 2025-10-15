import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenus, deleteMenu } from "../services/menu";

export default function MenuList() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const role = localStorage.getItem("role");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMenus();
        setMenu(data);
      } catch (err) {
        setError("❌ โหลดเมนูไม่สำเร็จ");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(item) {
    if (!window.confirm(`ต้องการลบเมนู "${item.name}" หรือไม่?`)) return;

    try {
      setDeletingId(item.id);
      await deleteMenu(item.id); // DELETE /menu/delete/:id
      // ลบออกจาก state แบบทันที
      setMenu((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err) {
      console.error("Delete menu error:", err?.response?.status, err?.response?.data);
      const status = err?.response?.status;
      if (status === 401) alert("โปรดเข้าสู่ระบบอีกครั้ง");
      else if (status === 403) alert("สำหรับผู้ดูแลระบบเท่านั้น");
      else alert(err?.response?.data?.message || "ลบเมนูไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-center p-6">กำลังโหลดเมนู...</p>;
  if (error) return <p className="text-center p-6 text-red-500 font-medium">{error}</p>;

  return (
  <div className="p-6 max-w-6xl mx-auto">
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-4 sm:mb-0">🍜 Menu List</h1>
      {role === "admin" && (
        <Link
          to="/menu/add"
          className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 hover:shadow-lg transition duration-300"
        >
          + Add Menu
        </Link>
      )}
    </div>

    {menu.length === 0 ? (
      <p className="text-gray-500 text-center text-lg">ยังไม่มีเมนูในระบบ</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menu.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-indigo-700 mb-2">{item.name}</h2>
              <p className="text-gray-600 mb-4">{item.description}</p>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <p className="text-green-600 font-bold text-xl">${item.price?.toFixed(2)}</p>
              {role === "admin" && (
                <div className="flex gap-2">
                  <Link
                    to={`/menu/edit/${item.id}`}
                    className="px-3 py-1 bg-yellow-400 text-white font-semibold rounded-lg shadow hover:bg-yellow-500 hover:shadow-md transition duration-300"
                  >
                     Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="px-3 py-1 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 hover:shadow-md transition duration-300 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting..." : " Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
