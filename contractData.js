const contractABI = [
    {
      "inputs": [],
      "name": "getHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ipfsHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "storeHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  
  const contractAddress = '0xYourDeployedContractAddress'; // Replace with your contract's address
  