import api from "../lib/api";

// ✅ สร้างออเดอร์ใหม่ (member เท่านั้น)
export const createOrder = (items) =>
  api.post(
    "/orders/create",
    { items }, // payload
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );

// ✅ ดึงออเดอร์ของฉัน
export const getMyOrders = () =>
  api.get("/orders/my", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ✅ ยกเลิกออเดอร์ของฉัน
export const cancelOrder = (id) =>
  api.delete(`/orders/cancel/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ✅ ดึงออเดอร์ทั้งหมด (Admin)
export const getAllOrdersAdmin = () =>
  api.get("/orders/admin", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

// ✅ อัปเดตสถานะออเดอร์ (Admin)
export const adminUpdateOrderStatus = (id, status) =>
  api.put(
    `/orders/admin/update-status/${id}`,
    { status },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
