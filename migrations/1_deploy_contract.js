const MultisigWallet = artifacts.require("MultisigWallet");

module.exports = function(deployer){
    let accounts = ["0xB37886973b3bbb4d9a2CcAb2a9Ab0914a46F3b60", 
    "0x16cC187AF3bc8fce7AEF43007f4d5Daf93E022BD",
    "0xe8033024b4A08462886Fe2ba1ce5AF06e0418308"];
    deployer.deploy(MultisigWallet, accounts, 2);
}