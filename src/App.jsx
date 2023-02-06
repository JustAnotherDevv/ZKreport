import { useState } from "react";
import logo from "./logo.svg";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal, Web3Button } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig, useAccount } from "wagmi";
import Home from "./pages/Home";
import Create from "./pages/Create";
import NewAudit from "./pages/NewAudit";
import Web3 from "web3";
import {
  mainnet,
  polygon,
  optimism,
  goerli,
  polygonMumbai,
} from "@wagmi/core/chains";

function App() {
  const hyperspace = {
    id: 3141,
    name: "Hyperspace",
    network: "Filecoin - Hyperspace testnet",
    nativeCurrency: {
      decimals: 18,
      name: "tFil",
      symbol: "tFil",
    },
    rpcUrls: {
      public: { http: ["https://api.hyperspace.node.glif.io/rpc/v1"] },
      default: { http: ["https://api.hyperspace.node.glif.io/rpc/v1"] },
    },
  };

  const chains = [hyperspace];

  // Wagmi client
  const { provider } = configureChains(chains, [
    walletConnectProvider({
      projectId: `${import.meta.env.VITE_WALLECT_CONNECT_PROJECT_ID}`,
      themeColor: "green",
    }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    provider,
  });

  // Web3Modal Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chains);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Navbar />}>
        <Route path="home" element={<Home />} />
        <Route path="create" element={<Create />} />
        <Route path="newAudit" element={<NewAudit />} />
      </Route>
    )
  );

  return (
    <div className="App">
      <Web3Modal
        projectId={`${import.meta.env.VITE_WALLECT_CONNECT_PROJECT_ID}`}
        themeColor="green"
        themeBackground="themeColor"
        ethereumClient={ethereumClient}
      />
      <WagmiConfig client={wagmiClient}>
        <div className="flex flex-col h-screen justify-between">
          <main className="">
            <RouterProvider router={router} />
          </main>
        </div>
      </WagmiConfig>
    </div>
  );
}

export default App;
