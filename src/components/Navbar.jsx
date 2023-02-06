import { useState } from "react";
import { Web3Modal, Web3Button } from "@web3modal/react";
import { truncateStr } from "../utils";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";

function Navbar() {
  const { address, isConnected } = useAccount();
  return (
    <div className="navbar bg-base-100 absolute">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">ZKREPORT</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>Audits</a>
          </li>
          <li>
            <Web3Button className="" themeColor="" />
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
