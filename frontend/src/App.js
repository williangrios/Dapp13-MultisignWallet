import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter, { async } from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";

import { format6FirstsAnd6LastsChar, formatDate } from "./utils";
import meta from "./assets/metamask.png";


function App() {

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [provider, setProvider] = useState();
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();

  const [approvers, setApprovers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [quorum, setQuorum] = useState('');
  const [nextId, setNextId]= useState('');
  const [transfers, setTransfers]= useState([]);

  const [addressTo, setAddressTo]= useState('');
  const [valueTransfer, setValueTransfer]= useState('');

  const [valueDeposit, setValueDeposit]= useState('');

  const [userAccount, setUserAccount]= useState('');

  const contractAddress = '0x823a601543b254be7197b05c48648F103cC8d3d1';

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
  
  async function handleConnectWallet (){
    try {
      setLoading(true)
      let userAcc = await provider.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});

      const contrSig = new ethers.Contract(contractAddress, abi, provider.getSigner())
      setSigner( contrSig)

    } catch (error) {
      if (error.message == 'provider is undefined'){
        toastMessage('No provider detected.')
      }
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    
    async function getData() {
      try {
        const {ethereum} = window;
        if (!ethereum){
          toastMessage('Metamask not detected');
          return
        }
  
        const prov =  new ethers.providers.Web3Provider(window.ethereum);
        setProvider(prov);

        const contr = new ethers.Contract(contractAddress, abi, prov);
        setContract(contr);
        
        if (! await isGoerliTestnet()){
          toastMessage('Change to goerli testnet.')
          return;
        }

        //contract data
        let approv = await contr.getApprovers();
        setApprovers(  approv);
        setBalance( await contr.balanceOf());
        setQuorum( await contr.quorum());
        setNextId( await contr.nextId());
        let transfers =  await contr.getTransfers()
        setTransfers( transfers);
        
      } catch (error) {
        toastMessage(error.reason)        
      }
      
    }

    getData()  
    
  }, [])
  
  function isConnected(){
    if (!user.connected){
      toastMessage('You are not connected!')
      return false;
    }
    
    return true;
  }

  async function isGoerliTestnet(){
    const goerliChainId = "0x5";
    const respChain = await getChain();
    return goerliChainId == respChain;
  }

  async function getChain() {
    const currentChainId = await  window.ethereum.request({method: 'eth_chainId'})
    return currentChainId;
  }

  async function handleDisconnect(){
    try {
      setUser({});
      setSigner(null);
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

 
  async function handleCreateTransfer(){
    
    try {
      if (!isConnected()) {
        return;
      }
      if (! await isGoerliTestnet()){
        toastMessage('Change to goerli testnet.')
        return;
      }
      setLoading(true);
      const resp  = await signer.createTransfer(valueTransfer, addressTo);  
      await resp.wait();
      toastMessage("Transfer created, refresh page.")
    } catch (error) {
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }
    
    
  }

  async function handleDeposit(){
    try {
      if (!isConnected()) {
        return;
      }
      if (! await isGoerliTestnet()){
        toastMessage('Change to goerli testnet.')
        return;
      }
      setLoading(true);
      const resp  = await signer.deposit({value: valueDeposit});  
      await resp.wait();
      toastMessage("Value deposited.")
    } catch (error) {
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }
  }

  async function handleTransfer(transferId){
    
    try {
      if (!isConnected()) {
        return;
      }
      if (! await isGoerliTestnet()){
        toastMessage('Change to goerli testnet.')
        return;
      }
      setLoading(true);
      const resp  = await signer.sendTransfer(transferId);  
      await resp.wait();
      toastMessage("Success.")
    } catch (error) {
      toastMessage(error.reason)      
    } finally{
      setLoading(false);
    }

  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Multisign Wallet" image={true} />
      <WRInfo chain="Goerli" testnet="true" />
      <WRContent>
 
        <h1>MULTISIGN WALLET</h1>

        {loading && 
          <h1>Loading....</h1>
        }
        { !user.connected ?<>
            <Button className="commands" variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect to Metamask
            </Button></>
          : <>
            <label>Welcome {format6FirstsAnd6LastsChar(user.account)}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }
        <hr/> 

        {quorum !== '' &&
          
          <>
          <h2>MultisigWallet Info</h2>
          <label>Balance: {(balance).toString()} wei</label>
          <label>Quorum minimum: {(quorum).toString()}</label>
          <label>Transfers registered: {(nextId).toString()}</label>
          <label>Approvers</label>
          {
            approvers.map((item, ind) =>  
              <label key={ind}>{item}</label>
            )
          }
          
          <hr/>
          <h2>Deposit funds</h2>
          <input type="number" className="mb-1 col-3" placeholder="Value to deposit" onChange={(e) => setValueDeposit(e.target.value)} value={valueDeposit}/>
          <button className="btn btn-primary col-3" onClick={handleDeposit} >Deposit funds</button>
          <hr/>
          <h2>Create transfer</h2>
          <input type="text" className="mb-1 col-3" placeholder="Address to" onChange={(e) => setAddressTo(e.target.value)} value={addressTo}/>
          <input type="number" className="mb-1 col-3" placeholder="Value to transfer" onChange={(e) => setValueTransfer(e.target.value)} value={valueTransfer}/>
          <button className="btn btn-primary col-3" onClick={handleCreateTransfer} >Create transfer</button>
          <hr/>
          <h2>Transfers</h2>
          { transfers.length > 0 ?
            <table className="table">
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
                    <td>{!item.sent ? (<button className="btn btn-primary" onClick={() => handleTransfer(ind)}>Approve/Send Transfer</button>) : <p>Transferred</p> }</td>
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
