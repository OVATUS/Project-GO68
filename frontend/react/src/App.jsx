// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// List Menu
import Home from "./pages/Home";
import Layout from "./components/Layout";
import EditMenu from "./pages/EditMenu";
import MenuAdmin from "./pages/MenuAdmin";
import Menu from "./pages/MenuList";
import AddMenu from "./pages/AddMenu";
// เกี่ยวกับ order
import CreateOrder from "./pages/orders/CreateOrder";
import MyOrders from "./pages/orders/MyOrders";
import CancelOrder from "./pages/orders/CancelOrder";
import AdminOrders from "./pages/admin/AdminOrders";
import UpdateOrderStatus from "./pages/admin/UpdateOrderStatus";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";


function App() {
  return (
    <Router>
      <Layout/>
        {/*Navbar*/}
      <Routes>
        <Route path="/menu/edit/:id" element={<EditMenu />} />
        <Route path="/admin" element={<MenuAdmin />} />
        <Route path="/menu" element={<Menu />}/>
        <Route path="/menu/add" element={<AddMenu />} />
        <Route path="/orders/create" element={<CreateOrder />} />
        <Route path="/orders/my" element={<MyOrders />} />
        <Route path="/orders/cancel/:id" element={<CancelOrder />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/update-status/:id" element={<UpdateOrderStatus />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
