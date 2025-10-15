import api from "../lib/api";

// GET เมนู (มีอยู่แล้ว)
export const getMenus = () => api.get("/menu");

// ✅ สร้างเมนูใหม่ (ต้องเป็นแอดมินและมี JWT)

export const createMenu = (payload) =>
  api.post("/menu/add", payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ✅ แก้ไขเมนู (ต้องเป็นแอดมิน + มี JWT)
export const updateMenu = (id, payload) =>
  api.put(`/menu/edit/${id}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ✅ ลบเมนู (ต้องเป็นแอดมิน)
export const deleteMenu = (id) =>
  api.delete(`/menu/delete/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });