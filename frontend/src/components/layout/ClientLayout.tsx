import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import Navbar from "./Navbar.tsx"; // navbar client
import Body from "./Body.tsx"; // body client
import { Outlet } from "react-router-dom";

export default function ClientLayout() {
  return (
    <>
      <Header />
      <Navbar />
      <Body>
        <Outlet />
      </Body>
      <Footer />
    </>
  );
}
