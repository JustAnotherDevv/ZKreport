import { useState, useEffect, useContext, useRef } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import { PlusIcon } from "@heroicons/react/24/outline";
import lighthouse from "@lighthouse-web3/sdk";
import { getAccount } from "@wagmi/core";
import { defaultMd } from "../utils";
import ReactMarkdown from "react-markdown";
// import * as auditTemplate from "./../auditTemplate.md";
import AuditReport from "../ABI/AuditReport_metadata.json";

function NewAudit() {
  const [fileList, setFileList] = useState([]);
  const [auditText, setAuditText] = useState("");
  const [chosenAuditor, setChosenAuditor] = useState("");
  const [fileURL, setFileURL] = useState(null);
  const textAreaRef = useRef(null);

  const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);

  const listItems = fileList.map((i, index) => (
    <tr className="hover self-center center" key={index}>
      <td className="">{i.fileName}</td>
      <td className="">{i.mimeType}</td>
      <td className="">
        <button
          className="btn btn-sm btn-success"
          onClick={() => window.open(i.url)}
        >
          Get
        </button>
      </td>
    </tr>
  ));

  async function progressCallback(progressData) {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  }

  const deploy = async (e) => {
    // e = URL.createObjectURL(new Blob([auditText], { type: "text/html" }));

    console.log(e);

    (e.target.files = [
      await new File([auditText], "foo.txt", {
        type: "text/plain",
      }),
    ]),
      //e.target.files = fileList;
      console.log(auditText, "\n", e);

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

    e.target.files = [
      await new File([fileURL], `${getAccount().address}.zip`, {
        type: "application/x-zip-compressed",
      }),
    ];

    const sig = await encryptionSignature();
    const response = await lighthouse.uploadEncrypted(
      e,
      sig.publicKey,
      `${import.meta.env.VITE_LIGHTHOUSE_API_KEY}`,
      sig.signedMessage,
      progressCallback
    );
    console.log(response);

    let networkProvider = ethers.getDefaultProvider(
      `https://api.hyperspace.node.glif.io/rpc/v1`
    );
    let auditContract = new ethers.Contract(
      `${import.meta.env.VITE_DEPLOYED_AUDIT_REPORT_ADDRESS}`,
      AuditReport.output.abi,
      metamaskProvider.getSigner()
    );

    const tx = await auditContract.addAudit(
      response.data.Hash,
      "test",
      chosenAuditor
    );
    console.log(tx);
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

  function switchTab(v) {
    setActiveTab(v);
  }

  const handleTextAreaChange = (event) => {
    setChosenAuditor(event.target.value);
  };

  useEffect(() => {
    (async () => {
      console.log(getAccount().address);

      import("./../auditTemplate.md").then((res) => {
        fetch(res.default)
          .then((response) => response.text())
          //   .then((text) => console.log(text));
          .then((text) => setAuditText(text));
      });

      //   await getMyUploads();
    })();
  }, []);

  return (
    <div className="flex justify-around items-center flex-col bg-base-300 min-h-screen">
      <div className="flex justify-around items-center flex-col">
        <div className="flex flex-col items-center">
          <h2 className="py-16 text-3xl">
            Begin new audit by selecting zipped code repo and the auditor
            address
          </h2>
          <input
            type="file"
            className="file-input file-input-bordered file-input-success w-full max-w-xs"
            accept=".zip, .rar"
            onChange={(e) => setFileURL(e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Insert auditor wallet..."
            className="input input-bordered w-full max-w-xs my-8"
            value={chosenAuditor}
            ref={textAreaRef}
            onChange={handleTextAreaChange}
          />
        </div>
        <button
          className="btn btn-success my-8"
          onClick={(e) => deployEncrypted(e)}
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export default NewAudit;
