import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");
    setRole(storedRole);
    setToken(storedToken);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass = (path) =>
    `group relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
      location.pathname === path
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 hover:shadow-md"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* โลโก้ - อัพเกรด! */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <span className="text-2xl">🍜</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
              FoodApp
            </span>
          </Link>

          {/* ปุ่มมือถือ - อัพเกรด! */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all duration-300 hover:scale-110"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="text-xl">{menuOpen ? "✖" : "☰"}</span>
            </button>
          </div>

          {/* เมนูหลัก - อัพเกรด! */}
          <div
            className={`${
              menuOpen ? "block absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-indigo-100 py-4" : "hidden"
            } md:flex space-y-2 md:space-y-0 md:space-x-2 md:items-center`}
          >
            {/* เมนูทั่วไป */}
            <Link to="/" className={linkClass("/")}>
            
              <span>Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link to="/menu" className={linkClass("/menu")}>
              
              <span>Menu</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* เฉพาะแอดมิน */}
            {role === "admin" && (
              <>
                <Link to="/menu/add" className={linkClass("/menu/add")}>
                  
                  <span>Add Menu</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/admin/orders" className={linkClass("/admin/orders")}>
                  
                  <span>Admin Orders</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {/* เฉพาะ member */}
            {role === "member" && (
              <>
                <Link to="/orders/create" className={linkClass("/orders/create")}>
                  <span>Create Order</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/orders/my" className={linkClass("/orders/my")}>
                  <span>My Orders</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {/* guest */}
            {!token && (
              <>
                <Link to="/login" className={linkClass("/login")}>
                  
                  <span>Login</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/register" className={linkClass("/register")}>
                  
                  <span>Register</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </>
            )}

            {/* Logout - อัพเกรด! */}
            {token && (
              <button
                onClick={handleLogout}
                className="px-6 py-3  text-black rounded-xl font-semibold hover:from-red-600 hover:to-red-700  transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 ml-2 md:ml-0"
              >
                <span>Logout</span>
              </button>
            )}

            {/* Role Badge - ใหม่! */}
            {token && (
              <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-bold ml-2">
                {role === "admin" ? " ADMIN" : " MEMBER"}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}