import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import { PlusIcon } from "@heroicons/react/24/outline";
import lighthouse from "@lighthouse-web3/sdk";
import { getAccount } from "@wagmi/core";
import AuditReport from "../ABI/AuditReport_metadata.json";
import { truncateStr } from "../utils";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Routes,
} from "react-router-dom";

function Home() {
  // const { account, connect, disconnect, chainId, web3 } =
  // useContext(Web3ModalContext);
  const [audits, setAudits] = useState("0");
  const [files, setFiles] = useState("0");
  const [fileList, setFileList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [sharedList, setSharedList] = useState([]);

  const ReportStatus = [
    "STARTED",
    "AWAITING",
    "SHARED",
    "COMPLETED",
    "FINALIZED",
  ];

  const listItems = fileList.map((i, index) => (
    <tr className="hover self-center center" key={index}>
      <td className="">{i.fileName}</td>
      <td className="">{i.mimeType}</td>
      <td className="">
        <button className="btn btn-sm btn-success">
          <a
            href={`https://files.lighthouse.storage/viewFile/${i.cid}`}
            target="_blank"
          >
            Open
          </a>
        </button>
      </td>
    </tr>
  ));

  const listAudits = auditList.map((i, index) => (
    <tr className="hover self-center center" key={index}>
      <td className="">{i[2].toNumber()}</td>
      <td className="">{truncateStr(i[5])}</td>
      <td className="">{ReportStatus[i[1]]}</td>
      <td className="">
        <button className="btn btn-sm btn-success">
          <Link
            className={``}
            to={`/create/${i[2].toNumber()}/${i[0]}/${i[3]}/${
              ReportStatus[i[1]]
            }`}
          >
            <a className="">Open</a>
          </Link>
        </button>
      </td>
    </tr>
  ));

  const listShared = sharedList.map((i, index) => (
    <tr className="hover self-center center" key={index}>
      <td className="">{i[2].toNumber()}</td>
      <td className="">{truncateStr(i[0])}</td>
      <td className="">{ReportStatus[i[1]]}</td>
      <td className="">
        <button className="btn btn-sm btn-success">
          <Link
            className={``}
            to={`/create/${i[2].toNumber()}/${i[0]}/${i[3]}/${
              ReportStatus[i[1]]
            }`}
          >
            <a className="">Open</a>
          </Link>
        </button>
      </td>
    </tr>
  ));

  const listEmpty = (
    <tr className="hover self-center center">
      <td className="">Empty</td>
      <td className=""></td>
      <td className=""></td>
      <td className=""></td>
    </tr>
  );

  const listEmptyFiles = (
    <tr className="hover self-center center">
      <td className="">Empty</td>
      <td className=""></td>
      <td className=""></td>
    </tr>
  );

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const deploy = async (e) => {
    // Push file to lighthouse node
    // Both file and folder supported by upload function
    const output = await lighthouse.upload(
      e,
      `${import.meta.env.VITE_LIGHTHOUSE_API_KEY}`,
      progressCallback
    );
    console.log("File Status:", output);
    /*
      output:
        {
          Name: "filename.txt",
          Size: 88000,
          Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
        }
      Note: Hash in response is CID.
    */

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const encryptionSignature = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const messageRequested = (await lighthouse.getAuthMessage(address)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return {
      signedMessage: signedMessage,
      publicKey: address,
    };
  };

  /* Deploy file along with encryption */
  const deployEncrypted = async (e) => {
    /*
       uploadEncrypted(e, publicKey, accessToken, uploadProgressCallback)
       - e: js event
       - publicKey: wallets public key
       - accessToken: your api key
       - signedMessage: message signed by the owner of publicKey
       - uploadProgressCallback: function to get progress (optional)
    */
    const sig = await encryptionSignature();
    const response = await lighthouse.uploadEncrypted(
      e,
      sig.publicKey,
      `${import.meta.env.VITE_LIGHTHOUSE_API_KEY}`,
      sig.signedMessage,
      progressCallback
    );
    console.log(response);
    /*
      output:
        {
          Name: "c04b017b6b9d1c189e15e6559aeb3ca8.png",
          Size: "318557",
          Hash: "QmcuuAtmYqbPYmPx3vhJvPDi61zMxYvJbfENMjBQjq7aM3"
        }
      Note: Hash in response is CID.
    */
  };

  const [fileURL, setFileURL] = useState(null);

  const sign_auth_message = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data
      .message;
    const signedMessage = await signer.signMessage(messageRequested);
    return { publicKey: publicKey, signedMessage: signedMessage };
  };

  /* Decrypt file */
  const decrypt = async () => {
    // Fetch file encryption key
    const cid = "QmPjRHNqzwPJDEK4eRUbMdSZpHAVdBU5s1gvTKiXPkViNV"; //replace with your IPFS CID
    const { publicKey, signedMessage } = await sign_auth_message();
    console.log(signedMessage);
    /*
      fetchEncryptionKey(cid, publicKey, signedMessage)
        Parameters:
          CID: CID of the file to decrypt
          publicKey: public key of the user who has access to file or owner
          signedMessage: message signed by the owner of publicKey
    */
    const keyObject = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );

    // Decrypt file
    /*
      decryptFile(cid, key, mimeType)
        Parameters:
          CID: CID of the file to decrypt
          key: the key to decrypt the file
          mimeType: default null, mime type of file
    */

    const fileType = "image/jpeg";
    const decrypted = await lighthouse.decryptFile(
      cid,
      keyObject.data.key,
      fileType
    );
    console.log(decrypted);
    /*
      Response: blob
    */

    // View File
    const url = URL.createObjectURL(decrypted);
    console.log(url);
    setFileURL(url);
  };

  const applyAccessConditions = async (e) => {
    // CID on which you are applying encryption
    // CID is generated by uploading a file with encryption
    // Only the owner of the file can apply access conditions
    const cid = "QmZkEMF5y5Pq3n291fG45oyrmX8bwRh319MYvj7V4W4tNh";

    // Conditions to add
    const conditions = [
      {
        id: 1,
        chain: "Optimism",
        method: "getBlockNumber",
        standardContractType: "",
        returnValueTest: {
          comparator: ">=",
          value: "13349",
        },
      },
    ];

    // Aggregator is what kind of operation to apply to access conditions
    // Suppose there are two conditions then you can apply ([1] and [2]), ([1] or [2]), !([1] and [2]).
    const aggregator = "([1])";
    const { publicKey, signedMessage } = await encryptionSignature();

    /*
      accessCondition(publicKey, cid, signedMessage, conditions, aggregator)
        Parameters:
          publicKey: owners public key
          CID: CID of file to decrypt
          signedMessage: message signed by owner of publicKey
          conditions: should be in format like above
          aggregator: aggregator to apply on conditions
    */
    const response = await lighthouse.accessCondition(
      publicKey,
      cid,
      signedMessage,
      conditions,
      aggregator
    );

    console.log(response);
    /*
      {
        data: {
          cid: "QmZkEMF5y5Pq3n291fG45oyrmX8bwRh319MYvj7V4W4tNh",
          status: "Success"
        }
      }
    */
  };

  async function getMyUploads() {
    console.log(await lighthouse.getUploads(getAccount().address));
    setFileList(
      await (
        await lighthouse.getUploads(getAccount().address)
      ).data.uploads
    );
  }

  async function test() {
    let networkProvider = ethers.getDefaultProvider(
      `https://api.hyperspace.node.glif.io/rpc/v1`
    );
    let auditContract = new ethers.Contract(
      `${import.meta.env.VITE_DEPLOYED_AUDIT_REPORT_ADDRESS}`,
      AuditReport.output.abi,
      networkProvider
    );
    console.log(auditContract);
    const tx = await auditContract.getUser(getAccount().address);
    console.log(tx);
    setAudits(tx[0].toNumber());
    setFiles(tx[1].toNumber());
    setAuditList(await auditContract.getOwnedAudits(getAccount().address));
    setSharedList(
      await auditContract.getPermissionedAudits(getAccount().address)
    );
  }

  useEffect(() => {
    (async () => {
      console.log(getAccount().address);
      await getMyUploads();
      await test();
    })();
  }, []);

  return (
    <div className="flex justify-start items-center flex-col min-h-screen rounded bg-base-300">
      <div className="stats shadow mt-32 mb-8">
        <div className="stat">
          <div className="stat-figure text-primary"></div>
          <div className="stat-title">Your audits</div>
          <div className="stat-value text-success">{audits}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary"></div>
          <div className="stat-title">Shared with you</div>
          <div className="stat-value text-success ">{files}</div>
        </div>
      </div>
      <div className="flex w-2/3 justify-between gap-12">
        <div className="w-full flex flex-col items-center">
          <h2 className="py-5 text-3xl">Your audits</h2>
          <table className="table w-full text-white">
            <thead className="bg-success">
              <tr>
                <th className="bg-transparent">Id</th>
                <th className="bg-transparent">Auditor</th>
                <th className="bg-transparent">Status</th>
                <th className="bg-transparent"></th>
              </tr>
            </thead>
            <tbody>{listAudits.length == 0 ? listEmpty : listAudits}</tbody>
          </table>
        </div>
        <div className="w-full flex flex-col items-center ">
          <h2 className="py-5 text-3xl w-full">Shared with you</h2>
          <table className="table w-full text-white">
            <thead className="bg-success">
              <tr>
                <th className="bg-transparent">Id</th>
                <th className="bg-transparent">Owner</th>
                <th className="bg-transparent">Status</th>
                <th className="bg-transparent"></th>
              </tr>
            </thead>
            <tbody>{listShared.length == 0 ? listEmpty : listShared}</tbody>
          </table>
        </div>
      </div>
      <div className="mt-10 mb-24 w-1/3 flex flex-col items-center">
        <h2 className="py-5 text-3xl">Your files</h2>
        <table className="table w-full text-white">
          <thead className="bg-success">
            <tr>
              <th className="bg-transparent">Name</th>
              <th className="bg-transparent">File type</th>
              <th className="bg-transparent"></th>
            </tr>
          </thead>
          <tbody>{listItems.length == 0 ? listEmptyFiles : listItems}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
