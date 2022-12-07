import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import { ethers } from "ethers";
import './App.css';
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { _toEscapedUtf8String } from "ethers/lib/utils";

function App() {

  const [approvers, setApprovers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [quorum, setQuorum] = useState('');
  const [nextId, setNextId]= useState('');
  const [transfers, setTransfers]= useState([]);

  const [addressTo, setAddressTo]= useState('');
  const [valueTransfer, setValueTransfer]= useState('');

  const [valueDeposit, setValueDeposit]= useState('');

  const addressContract = '0xbd52560E5DF8f76B8983132390ab49A42e5e4eD4';

  const abi = [
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "_approvers",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "_quorum",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "approvals",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "approvers",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "arrayTransfers",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "approvals",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "sent",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "nextId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "quorum",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getApprovers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTransfers",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "approvals",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sent",
              "type": "bool"
            }
          ],
          "internalType": "struct MultisigWallet.Transfer[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "createTransfer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "sendTransfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
  
  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  useEffect(() => {

    getData()
    
  }, [])
  

  function getProvider(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, abi, provider)
    }
    if (contractDeployedSigner == null){
      contractDeployedSigner = new ethers.Contract(addressContract, abi, provider.getSigner());
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getData() {
    getProvider();
    let approv = await contractDeployed.getApprovers();
    setApprovers(  approv);
    setBalance( await contractDeployed.balanceOf());
    setQuorum( await contractDeployed.quorum());
    setNextId( await contractDeployed.nextId());
    let transfers =  await contractDeployed.getTransfers()
    setTransfers( transfers);
  }
 
  async function handleCreateTransfer(){
    getProvider();
    try {
      const resp  = await contractDeployedSigner.createTransfer(valueTransfer, addressTo);  
      toastMessage("Transfer created, wait some seconds to refresh page.")
    } catch (error) {
      toastMessage(error.data.message);
    }
  }

  async function handleDeposit(){
    getProvider();
    try {
      const resp  = await contractDeployedSigner.deposit({value: valueDeposit});  
      toastMessage("Value deposited.")
    } catch (error) {
      toastMessage(error.data.message);
    }
  }

  async function handleTransfer(transferId){
    getProvider();
    try {
      const resp  = await contractDeployedSigner.sendTransfer(transferId);  
      toastMessage("Success.")
    } catch (error) {
      toastMessage(error.data.message);
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Multisign Wallet" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
 
        {quorum == '' ?
          <>
            <button onClick={getData}>Load data from blockchain</button>
          </>
          : 
          <>
          <h2>MultisigWallet Info</h2>
          <h5>Balance: {(balance).toString()} wei</h5>
          <h5>Quorum minimum: {(quorum).toString()}</h5>
          <h5>Transfers registered: {(nextId).toString()}</h5>
          <h5>Approvers</h5>
          {
            approvers.map((item, ind) =>  
              <p key={ind}>{item}</p>
            )
          }
          
          <hr/>
          <h2>Deposit funds</h2>
          <input type="text" placeholder="Value to deposit" onChange={(e) => setValueDeposit(e.target.value)} value={valueDeposit}/>
          <button onClick={handleDeposit} >Deposit funds</button>
          <hr/>
          <h2>Create transfer</h2>
          <input type="text" placeholder="Address to" onChange={(e) => setAddressTo(e.target.value)} value={addressTo}/>
          <input type="text" placeholder="Value to transfer" onChange={(e) => setValueTransfer(e.target.value)} value={valueTransfer}/>
          <button onClick={handleCreateTransfer} >Create transfer</button>
          <hr/>
          <h2>Transfers</h2>
          { transfers.length > 0 ?
            <table>
              <thead>
                <tr>
                  <td style={{width: 100}}>Id</td>
                  <td style={{width: 100}}>Address to</td>
                  <td style={{width: 100}}>Value(wei)</td>
                  <td style={{width: 100}}>Approvals</td>
                  <td style={{width: 100}}>Sent</td>
                  <td style={{width: 100}}>Action</td>
                </tr>
              </thead>
              <tbody>
                {
                transfers.map((item, ind) =>  
                  <tr key={ind}>
                    <td>{(item.id).toString()}</td>
                    <td>{item.to}</td>
                    <td>{(item.amount).toString()}</td>
                    <td>{(item.approvals).toString()}</td>
                    <td>{item.sent.toString()}</td>
                    <td>{!item.sent ? (<button onClick={() => handleTransfer(ind)}>Approve/Send Transfer</button>) : <p>Transferred</p> }</td>
                  </tr>
                )}                
              </tbody>
            </table>:<p>No transfers registered</p>
          }

        </>
        
        }
        
      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />    
    </div>
  );
}

export default App;
