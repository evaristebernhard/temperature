# Primus Documentation for Monad Testnet

## Overview

Primus (formerly "PADO") is building the future of data interoperability. The mission of Primus is to enable secure, permissionless data verification and computation in blockchain and AI.

### Core Technologies

Our technology focuses on two key innovations: [zkTLS](../data-verification/tech-intro.md) and [zkFHE](../data-computation/understand-zkfhe-network.md). zkTLS builds on the Transport Layer Security (TLS) protocol by adding zero-knowledge proofs, so you can verify data authenticity without revealing the data itself. zkFHE takes this a step further, ensuring computations on encrypted data are secure and tamper-proof, even when outsourced.

## Monad Testnet Integration

### Contract Deployment

Primus is deployed on Monad Testnet to support zkTLS-based data verification and proof submission.

**Monad Testnet**

| Contract | Address                                    |
| -------- | ------------------------------------------ |
| Primus   | 0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431 |

## zkTLS SDK Integration Guide

### Prerequisites

Before you begin, ensure you have:
- Node.js (version 18 or later) installed on your system
- A paired appId and appSecret from the [Primus Developer Hub](https://dev.primuslabs.xyz)
- MetaMask or compatible wallet for Monad testnet

### zkTLS Modes

Primus zkTLS SDK supports two modes:

1. **proxytls** - Proxy TLS mode (default)
2. **mpctls** - MPC TLS mode

```javascript
// Set zkTLS mode, default is proxy mode. (This is optional)
const workMode = "proxytls"; // or "mpctls"
request.setAttMode({
  algorithmType: workMode,
});
```

### Frontend Example

Here's how to integrate Primus zkTLS SDK in your frontend application:

```javascript
import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";

// Initialize parameters, the init function is recommended to be called when the page is initialized.
const primusZKTLS = new PrimusZKTLS();
const appId = "YOUR_APPID";
const initAttestaionResult = await primusZKTLS.init(appId);
console.log("primusProof initAttestaionResult=", initAttestaionResult);

export async function primusProof() {
  // Set TemplateID and user address.
  const attTemplateID = "YOUR_TEMPLATEID";
  const userAddress = "YOUR_USER_ADDRESS";
  // Generate attestation request.
  const request = primusZKTLS.generateRequestParams(attTemplateID, userAddress);

  // Set additionParams. (This is optional)
  const additionParams = JSON.stringify({
    YOUR_CUSTOM_KEY: "YOUR_CUSTOM_VALUE",
  });
  request.setAdditionParams(additionParams);

  // Set zkTLS mode, default is proxy mode. (This is optional)
  const workMode = "proxytls";
  request.setAttMode({
    algorithmType: workMode,
  });

  // Transfer request object to string.
  const requestStr = request.toJsonString();

  // Get signed response from backend.
  const response = await fetch(`http://YOUR_URL:PORT?YOUR_CUSTOM_PARAMETER`);
  const responseJson = await response.json();
  const signedRequestStr = responseJson.signResult;

  // Start attestation process.
  const attestation = await primusZKTLS.startAttestation(signedRequestStr);
  console.log("attestation=", attestation);

  // Verify signature
  const verifyResult = await primusZKTLS.verifyAttestation(attestation);
  console.log("verifyResult=", verifyResult);

  if (verifyResult === true) {
    // Business logic checks, such as attestation content and timestamp checks
    // do your own business logic.
  } else {
    // If failed, define your own logic.
  }
}
```

### Backend Example

Here's how to set up the backend server to sign attestation requests:

```javascript
const express = require("express");
const cors = require("cors");
const { PrimusZKTLS } = require("@primuslabs/zktls-js-sdk");

const app = express();
const port = YOUR_PORT;

// Just for test, developers can modify it.
app.use(cors());

// Listen to the client's signature request and sign the attestation request.
app.get("/primus/sign", async (req, res) => {
  const appId = "YOUR_APPID";
  const appSecret = "YOUR_SECRET";

  // Create a PrimusZKTLS object.
  const primusZKTLS = new PrimusZKTLS();

  // Set appId and appSecret through the initialization function.
  await primusZKTLS.init(appId, appSecret);

  // Sign the attestation request.
  console.log("signParams=", req.query.signParams);
  const signResult = await primusZKTLS.sign(req.query.signParams);
  console.log("signResult=", signResult);

  // Return signed result.
  res.json({ signResult });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

### Core SDK Integration

For backend server integration, you can also use the Core SDK:

```typescript
const { PrimusCoreTLS } = require("@primuslabs/zktls-core-sdk");

async function primusProofTest() {
    // Initialize parameters, the init function is recommended to be called when the program is initialized.
    const appId = "PRIMUS_APP_ID";
    const appSecret= "PRIMUS_APP_SECRET";
    const zkTLS = new PrimusCoreTLS();
    const initResult = await zkTLS.init(appId, appSecret);
    console.log("primusProof initResult=", initResult);

    // Set request and responseResolves.
    const request ={
        url: "YOUR_CUSTOM_URL", // Request endpoint.
        method: "REQUEST_METHOD", // Request method.
        header: {}, // Request headers.
        body: "" // Request body.
    };
    // The responseResolves is the response structure of the url.
    // For example the response of the url is: {"data":[{ ..."instFamily": "","instType":"SPOT",...}]}.
    const responseResolves = [
        {
            keyName: 'CUSTOM_KEY_NAME', // According to the response keyname, such as: instType.
            parsePath: 'CUSTOM_PARSE_PATH', // According to the response parsePath, such as: $.data[0].instType.
        }
    ];
    // Generate attestation request.
    const generateRequest = zkTLS.generateRequestParams(request, responseResolves);

    // Set zkTLS mode, default is proxy mode. (This is optional)
    generateRequest.setAttMode({
        algorithmType: "proxytls"
    });

    // Start attestation process.
    const attestation = await zkTLS.startAttestation(generateRequest);
    console.log("attestation=", attestation);
    
    const verifyResult = zkTLS.verifyAttestation(attestation);
    console.log("verifyResult=", verifyResult);
    if (verifyResult === true) {
        // Business logic checks, such as attestation content and timestamp checks
        // do your own business logic.
    } else {
        // If failed, define your own logic.
    }
}
```

## Smart Contract Integration

### Deploying Verification Contracts

Deploy the following contract to Monad Testnet to verify attestations:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPrimusZKTLS, Attestation } from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";

contract AttestorTest {
   address public primusAddress;

   constructor(address _primusAddress) {
      // Replace with the Monad testnet Primus address
      primusAddress = _primusAddress; // 0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431
   }

   function verifySignature(Attestation calldata attestation) public view returns(bool) {
        IPrimusZKTLS(primusAddress).verifyAttestation(attestation);

        // Business logic checks, such as attestation content and timestamp checks
        // do your own business logic
        return true;
   }
}
```

### On-chain Interaction Example

Here's how to interact with the smart contract from your frontend:

```javascript
//start attestation process
const attestation = await primusZKTLS.startAttestation(signedRequestStr);
console.log("attestation=", attestation);

if (verifyResult === true) {
    // Business logic checks, such as attestation content and timestamp checks
    // Do your own business logic

    // Interacting with Smart Contracts
    // Set contract address and ABI
    const contractData = {"YOUR_CONTRACT_ABI_JSON_DATA"};
    const abi = contractData.abi;
    const contractAddress = "YOUR_CONTRACT_ADDRESS_YOU_DEPLOYED";
    
    // Use ethers.js connect to the smart contract
    const provider = new ethers.providers.JsonRpcProvider("YOUR_MONAD_RPC_URL");
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        // Call verifyAttestation func
        const tx = await contract.verifySignature(attestation);
        console.log("Transaction:", tx);
    } catch (error) {
        console.error("Error in verifyAttestation:", error);
    }
} else {
    //not the primus sign, error business logic
}
```

### Complete Integration Workflow

Here's the complete workflow combining frontend, backend, and smart contract interaction:

```javascript
// 1. Frontend: Start attestation process
const attestation = await primusZKTLS.startAttestation(signedRequestStr);

// 2. Verify the attestation
const verifyResult = await primusZKTLS.verifyAttestation(attestation);

if (verifyResult === true) {
    // 3. Submit to smart contract on Monad testnet
    const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    const signer = provider.getSigner();
    
    const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    try {
        // 4. Call smart contract verification function
        const tx = await contract.verifySignature(attestation);
        await tx.wait(); // Wait for transaction confirmation
        
        console.log("Attestation verified on Monad testnet:", tx.hash);
        
        // 5. Execute your business logic
        // Your application logic here...
        
    } catch (error) {
        console.error("Smart contract interaction failed:", error);
    }
} else {
    console.error("Attestation verification failed");
}
```

## Monad Testnet Configuration

### Network Details

When connecting to Monad testnet, use these configuration details:

```javascript
// Monad Testnet Configuration
const monadTestnet = {
  chainId: "0x29a", // 666 in decimal
  chainName: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18
  },
  blockExplorerUrls: ["https://testnet-explorer.monad.xyz"]
};

// Add network to MetaMask
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [monadTestnet]
});
```

## Developer Hub Integration

To use Primus zkTLS SDK, you need to:

1. **Create Data Verification Templates**: Define the data source URL and network request containing the verified data
2. **Create Projects**: Obtain a unique pair of appID and appSecret for authentication

Visit the [Primus Developer Hub](https://dev.primuslabs.xyz) to:
- Create and manage templates
- Generate appID and appSecret pairs
- Test your integrations

## Installation

### Install zkTLS SDK

```bash
npm install --save @primuslabs/zktls-js-sdk
```

### Install Core SDK

```bash
npm install --save @primuslabs/zktls-core-sdk
```

### Install Smart Contract Library

```bash
# Using Hardhat
npm install @primuslabs/zktls-contracts

# Using Foundry
forge install primus-labs/zktls-contracts
```

## Attestation Structure

When a successful data verification process is completed, you will receive a standard attestation structure:

```json
{
  "recipient": "YOUR_USER_ADDRESS", // user's wallet address
  "request": {
    "url": "REQUEST_URL", // request url
    "header": "REQUEST_HEADER", // request header
    "method": "REQUEST_METHOD", // request method
    "body": "REQUEST_BODY" // request body
  },
  "reponseResolve": [
    {
      "keyName": "VERIFY_DATA_ITEMS", // the "verify data items" you set in the template
      "parseType": "",
      "parsePath": "DARA_ITEM_PATH" // json path of the data for verification
    }
  ],
  "data": "{ACTUAL_DATA}", // actual data items in the request, stringified JSON object
  "attConditions": "[RESPONSE_CONDITIONS]", // response conditions, stringified JSON object
  "timestamp": TIMESTAMP_OF_VERIFICATION_EXECUTION, // timestamp of execution
  "additionParams": "", // additionParams from zkTLS sdk
  "attestors": [ // information of the attestors
    {
      "attestorAddr": "ATTESTOR_ADDRESS",  // the address of the attestor
      "url": "https://primuslabs.org"        // the attestor's url
    }
  ],
  "signatures": [
    "SIGNATURE_OF_THIS_VERIFICATION" // attestor's signature for this verification
  ]
}
```

## Error Handling

### Common Error Codes

| Error Code | Situation                                                                         |
| ---------- | --------------------------------------------------------------------------------- |
| 00000      | Operation too frequent. Please try again later.         |
| 00001      | Algorithm startup exception.         |
| 00002      | The verification process timed out.    |
| 00003      | A verification process is in progress. Please try again later. |
| 00004      | The user closes or cancels the verification process.                               |
| 00005      | Wrong SDK parameters.                        |
| 00012      | Invalid Template ID.                     |
| 00013      | Target data missing. Please check that the JSON path of the data in the response from the request URL matches your template.         |
| 00104      | Not met the verification requirements.             |
| -1002001     | Invalid App ID.                     |
| -1002002      | Invalid App Secret.                     |

### zkTLS Related Errors

| Error Code    | Situation                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| 10001 ~ 10004        | Unstable internet connection. Please try again. |
| 20001         | An internal error occurred.            |
| 20003         | Invalid algorithm parameters.                |
| 20005         | An internal error occurred.                |
| 30001         | Response error. Please try again.          |
| 30002         | Response check error.          |
| 30004         | Response parse error.          |
| 40002         | SSL certificate error.        |
| 50001         | An internal error occurred.          |
| 50003         | The client encountered an unexpected error.          |
| 50004         | The client not started. Please try again.          |
| 50006         | The algorithm server not started. Please try again.          |
| 50007         | Algorithm execution issues.   |
| 50008         | Abnormal execution results.    |
| 50009         | Algorithm service timed out.     |
| 50010         | Compatibility issues during algorithm execution.    |
| 50011         | Unsupported TLS version.   |
| 99999        | Undefined error.   |

## Resources

- zkTLS Resources:
  - [Whitepaper](https://eprint.iacr.org/2023/964)
  - [QuickSilver](https://eprint.iacr.org/2021/076)
- [Primus Extension](https://chromewebstore.google.com/detail/primus-prev-pado/oeiomhmbaapihbilkfkhmlajkeegnjhe)
- [Discord Community](https://discord.gg/AYGSqCkZTz)
- [GitHub Repository](https://github.com/primus-labs/zktls-js-sdk)

## Contact

For any questions or support, please contact our [Community](https://discord.gg/AYGSqCkZTz) for assistance.