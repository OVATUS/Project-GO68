import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMenus, updateMenu } from "../services/menu";

export default function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // ต้องล็อกอิน (และควรเป็น admin)
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/login");
    }
  }, [navigate]);

  // โหลดเมนูทั้งหมดแล้วหา item ตาม id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getMenus(); // GET /menu
        const item = data.find((m) => String(m.id) === String(id));
        if (!item) {
          setErrMsg("ไม่พบเมนูที่ต้องการแก้ไข");
        } else {
          setName(item.name || "");
          setDescription(item.description || "");
          setPrice(item.price ?? "");
        }
      } catch (err) {
        setErrMsg(err?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
        console.error("Load menu error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    const priceNum = parseFloat(price);
    if (!name.trim() || !description.trim() || isNaN(priceNum) || priceNum <= 0) {
      setErrMsg("กรุณากรอกข้อมูลให้ถูกต้อง (ราคา > 0)");
      return;
    }

    try {
      setSaving(true);
      await updateMenu(id, {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
      }); // PUT /menu/edit/:id
      navigate("/menu");
    } catch (err) {
      console.error("Update menu error:", err?.response?.status, err?.response?.data);
      const status = err?.response?.status;
      if (status === 401) setErrMsg("โปรดเข้าสู่ระบบอีกครั้ง");
      else if (status === 403) setErrMsg("สำหรับผู้ดูแลระบบเท่านั้น");
      else if (status === 404) setErrMsg("ไม่พบบันทึกเมนูนี้");
      else setErrMsg(err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">กำลังโหลด...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Menu</h1>

      {errMsg && (
        <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={saving}
          />
        </div>
        <div>
          <label className="block font-semibold">Price</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
            min="0"
            disabled={saving}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving..." : "Update Menu"}
        </button>
      </form>
    </div>
  );
}
