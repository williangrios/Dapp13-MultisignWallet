//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract MultisigWallet{
    address[] public approvers;
    uint public quorum;
    struct Transfer{
        uint id;
        uint amount;
        address payable  to;
        uint approvals;
        bool sent;
    }
    Transfer[] public arrayTransfers;
    mapping(uint => Transfer) transfers;
    uint public nextId;
    mapping (address => mapping(uint => bool)) public approvals;

    constructor (address[] memory _approvers, uint _quorum)  {
        approvers = _approvers;
        quorum = _quorum;
    }

    modifier onlyApprover(){
        bool allowed = false;
        for (uint i = 0 ; i < approvers.length; i++) {
            if (approvers[i] == msg.sender){
                allowed = true;
            }
        }
        require(allowed == true, 'Only approver allowed');
        _;
    }

    function getApprovers() external view returns (address[] memory){
        return approvers;
    }

    function getTransfers() external view returns (Transfer[] memory){
        return arrayTransfers;
    }

    function createTransfer(uint amount, address payable to) payable external onlyApprover() {
        Transfer memory newTransfer = Transfer(
        nextId,
        amount,
        to,
        0,
        false
        );
        transfers[nextId] = newTransfer;
        arrayTransfers.push(newTransfer);
        nextId ++;
    }

    function sendTransfer(uint id) external onlyApprover(){ 
        require(transfers[id].sent == false, 'Transfer has already been sent');
        require(approvals[msg.sender][id] == false, 'Cannot approve this transfer twice');
        require(address(this).balance >= transfers[id].amount, "Insufficient amount" );

        approvals [msg.sender][id]= true;
        transfers[id].approvals ++;
        arrayTransfers[id].approvals ++;

        if (transfers[id].approvals >= quorum){
            transfers[id].sent = true;
            arrayTransfers[id].sent = true;
            address payable to = transfers[id].to;
            uint amount = transfers[id].amount;
            to.transfer(amount);
            return;
        }

    }

    function deposit() public payable{

    }

    function balanceOf() view public returns (uint256){
        return address(this).balance;
    }

}