// Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-14">{children}</main> {/* ดันเนื้อหาไม่ให้ถูก Navbar บัง */}
    </>
  );
}
