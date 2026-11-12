import LandingPage from "./pages/LandingPage";
import AdminLandingPages from "./pages/admin/LandingPages";
import PremiumCursor from "./components/ui/PremiumCursor";
import "./components/ui/premium-cursor.css";
import AdminBranding from "./pages/admin/Branding";
import AdminBanners from "./pages/admin/Banners";
import MetaMarketing from "./pages/admin/MetaMarketing";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminSection from "./pages/admin/AdminSection";
import AdminProducts from "./pages/admin/Products";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <PremiumCursor />
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/orders/track" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/lp/:slug" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/branding" element={<AdminBranding />} />
        <Route path="/admin/meta-marketing" element={<MetaMarketing />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
                  <Route path="/admin/landing-pages" element={<AdminLandingPages />} />
        <Route path="/admin/:section" element={<AdminSection />} />
        <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
