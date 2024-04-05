import { useState } from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import PaintPanel from "./paint";
import TestPanel from './test'
import HomePanel from './Home'

export default function App() {

  return (
    <div>
      <h1>💗 请输入链接</h1>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePanel />} />
          <Route path="about" element={<PaintPanel />} />
          <Route path="test" element={<TestPanel />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          {/* <Route path="*" element={<NoMatch />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>

      <Outlet />
    </div>
  );
}





