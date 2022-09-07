// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract xToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Xtoken", "XTK") {
        _mint(msg.sender, initialSupply);
    }

        function mint(address _to, uint256 _amount) public onlyOwner {
        require(_to != address(0));
        require(_amount > 0);
        _mint(_to, _amount);
    }
}

contract MultiSigWallet is Ownable {
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

   
    enum Cointypes { ETH, ERC20 }

    struct Transaction {
        address to;
        uint amount;
        bool executed;
        uint numOfQuorumConfirmed;
        Cointypes choice;
    }
    Transaction[] public transactions;

    // mapping if address is a signer or owner
    mapping(address => bool) public isSigners;
    // mapping from tx index => owner or signer => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;
    //array of signers
    address[] public signers;

    address public erc20Address;
    uint public numOfSigners;


    //LIST OF MODIFIERS
    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already approved");
        _;
    }

    modifier onlySigners(){
        address signer = msg.sender;
        require(signer == owner() || isSigners[signer], "not Signers");
        _;
    }

    constructor() {
        signers.push(owner());
        isSigners[owner()] = true;
        numOfSigners += 1;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }


    function setERC20address(address _erc20Address) external onlyOwner{
        erc20Address = _erc20Address;
    }

    function addSigner (address _newSigner) external onlyOwner{
           require(!isSigners[_newSigner], "signers already added");
        isSigners[_newSigner] = true;
        signers.push(_newSigner);
        numOfSigners += 1;
    }

    function getSigners() public view returns(address[] memory){
        return signers;
    }

    function getTransactionCount() public view returns (uint){
        return transactions.length;
    }

    function submitETHTransaction(
        address _to,
        uint _amount
    ) 
    external
    onlySigners 
    {
        uint txIndex = transactions.length;

        transactions.push(
            Transaction({
            to: _to,
            amount: _amount,
            executed : false,
            numOfQuorumConfirmed: 0,
            choice: Cointypes.ETH
        })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _amount);
    }

    function submitERC20Transaction(
        address _to,
        uint _amount
    ) 
    external
    onlySigners 
    {
           uint txIndex = transactions.length;
        transactions.push(
            Transaction({
            to: _to,
            amount: _amount,
            executed : false,
            numOfQuorumConfirmed: 0,
            choice: Cointypes.ERC20
        })
        );
             emit SubmitTransaction(msg.sender, txIndex, _to, _amount);
    }

    function approveTransaction (uint _txIndex) 
    external
    onlySigners
    txExists(_txIndex)
    notExecuted(_txIndex)
    notConfirmed(_txIndex)
    {
            Transaction storage transaction = transactions[_txIndex];
            transaction.numOfQuorumConfirmed +=1;
            isConfirmed[_txIndex][msg.sender] = true;

            emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction (uint _txIndex) 
    external 
    payable
    onlySigners
    txExists(_txIndex)
    notExecuted(_txIndex)
     {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numOfQuorumConfirmed > numOfSigners  / 2
        , 
        "Not enough confirmations"
        );
        transaction.executed = true;

    
        // if eth
        if(transaction.choice == Cointypes.ETH){
        payable(transaction.to).transfer(transaction.amount);
        }
        else{
        // if erc20
        require(IERC20(erc20Address).balanceOf(msg.sender) >= transaction.amount, "you dont have enough balance");
        ERC20(erc20Address).transfer(transaction.to, transaction.amount);
    }

    
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
    

    function revokeTransaction (uint _txIndex) 
    external 
    onlySigners
    txExists(_txIndex)
    notExecuted(_txIndex)
    {
         Transaction storage transaction = transactions[_txIndex];
         require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

         transaction.numOfQuorumConfirmed -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

}