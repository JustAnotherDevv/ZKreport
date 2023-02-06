import { useState, useEffect, useContext, useRef } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import { PlusIcon } from "@heroicons/react/24/outline";
import lighthouse from "@lighthouse-web3/sdk";
import { getAccount } from "@wagmi/core";
import { defaultMd } from "../utils";
import ReactMarkdown from "react-markdown";
// import * as auditTemplate from "./../auditTemplate.md";

function Create() {
  const [fileList, setFileList] = useState([]);
  const [auditText, setAuditText] = useState("");
  const [activeTab, setActiveTab] = useState(true);
  const [fileURL, setFileURL] = useState(null);
  const textAreaRef = useRef(null);

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
    setAuditText(event.target.value);
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
    <div className="flex justify-start items-center flex-col bg-base-300 min-h-screen">
      <div className="h-24"></div>
      <div className="flex justify-around items-center flex-col">
        <div className="flex flex-col items-center">
          <h2 className="py-5 text-3xl">
            Add new audit report from files or create new one with markdown
          </h2>
          <div className="tabs">
            <a
              className={`tab tab-lifted ${activeTab ? "tab-active" : ""}`}
              onClick={() => switchTab(true)}
            >
              Edit
            </a>
            <a
              className={`tab tab-lifted ${activeTab ? "" : "tab-active"}`}
              onClick={() => switchTab(false)}
            >
              Preview
            </a>
          </div>
          <div className="bg-base-200 p-10 rounded-lg w-full flex flex-col items-center min-h-16">
            {!activeTab ? (
              <div className="prose text-left bg-base-200">
                <ReactMarkdown>{auditText}</ReactMarkdown>
              </div>
            ) : (
              <div className="w-full h-full">
                <textarea
                  className="textarea textarea-bordered w-full h-screen"
                  placeholder="Paste your audit report markdown here."
                  value={auditText}
                  ref={textAreaRef}
                  onChange={handleTextAreaChange}
                ></textarea>
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-success my-8" onClick={(e) => deploy(e)}>
          Upload
        </button>
      </div>
      <div>
        <p className="text-gray-600 pt-5">Upload your audit report below</p>
        <input onChange={(e) => deploy(e)} type="file" />
        <input onChange={(e) => deployEncrypted(e)} type="file" />
        <button onClick={() => decrypt()}>decrypt</button>
        {fileURL ? (
          <a href={fileURL} target="_blank">
            viewFile
          </a>
        ) : null}
        <button
          onClick={() => {
            applyAccessConditions();
          }}
        >
          Apply Access Consitions
        </button>
        <button
          onClick={() => {
            getMyUploads();
          }}
        >
          Get my files
        </button>
      </div>
    </div>
  );
}

export default Create;
