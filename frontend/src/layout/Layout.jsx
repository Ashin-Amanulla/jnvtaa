import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SitePopup from "@/components/SitePopup";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SitePopup />
    </div>
  );
}
