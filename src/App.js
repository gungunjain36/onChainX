'use client'

import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Pinata API Keys (loaded securely from environment variables)
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

const contractABI = [
  {
    inputs: [],
    name: "getHash",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ipfsHash",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_ipfsHash", type: "string" }],
    name: "storeHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contractAddress = "0x648b26Ce4136Ea096e20f433FA31Cd357AeD392D";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImageToPinata = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: "ImgEth",
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      setStatus("Uploading image to Pinata...");
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      });

      setStatus("Image uploaded to Pinata!");
      const ipfsHash = response.data.IpfsHash;
      console.log(ipfsHash);
      return response.data.IpfsHash; // Return the IPFS hash
    } catch (error) {
      console.error("Error uploading to Pinata: ", error);
      throw new Error("Failed to upload image to Pinata.");
    }
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsLoading(true);

    try {
      const ipfsHash = await uploadImageToPinata(file);

      if (!window.ethereum) {
        alert("Please install MetaMask");
        setIsLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setStatus("Storing hash on blockchain...");
      const tx = await contract.storeHash(ipfsHash, {
        gasLimit: ethers.utils.hexlify(300000),
      });

      setStatus("Waiting for transaction confirmation...");
      await tx.wait();
      setStatus("Image hash stored on blockchain successfully!");
    } catch (error) {
      console.error("Error: ", error);
      setStatus("Error uploading image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Upload Image to Blockchain</h1>
        <div className="mb-6">
          <label htmlFor="file-upload" className="flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-gray-400 hover:text-white transition-colors duration-300">
            <Upload className="w-8 h-8" />
            <span className="mt-2 text-base leading-normal">Select a file</span>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>
        {file && (
          <p className="text-sm text-gray-600 mb-4 text-center">
            Selected file: {file.name}
          </p>
        )}
        <button
          onClick={uploadImage}
          disabled={!file || isLoading}
          className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ${
            (!file || isLoading) && "opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload to Blockchain"}
        </button>
        {status && (
          <div className={`mt-4 p-4 rounded-lg ${
            status.includes("successfully") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}>
            <p className="flex items-center">
              {status.includes("successfully") ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

