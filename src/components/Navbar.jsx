import { useState } from "react";
import { Web3Modal, Web3Button } from "@web3modal/react";
import { truncateStr } from "../utils";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Routes,
} from "react-router-dom";
import Create from "../pages/Create";
import Home from "../pages/Home";
import NewAudit from "../pages/NewAudit";

function Navbar() {
  const { address, isConnected } = useAccount();
  return (
    <div className="">
      <div className="navbar bg-base-100 absolute">
        <div className="flex-1">
          <Link
            className={`rounded-lg hover:text-gray-700 hover:text-green-300/80 mx-2 active:bg-base-100`}
            to="/"
          >
            <a className="btn btn-ghost normal-case text-xl">ZKREPORT</a>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link
                className={`rounded-lg hover:text-gray-700 hover:text-green-300/80 mx-2 active:bg-base-100`}
                to="/"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                className={`rounded-lg hover:text-gray-700 hover:text-green-300/80 mx-2 active:bg-base-100`}
                to="/newAudit"
              >
                Audits
              </Link>
            </li>
            <li>
              <Web3Button className="" themeColor="" />
            </li>
          </ul>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="create" element={<Create />} />
        <Route path="newAudit" element={<NewAudit />} />
      </Routes>
    </div>
  );
}

export default Navbar;
