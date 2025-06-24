import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow bg-gray-50 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
