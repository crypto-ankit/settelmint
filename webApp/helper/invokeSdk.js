'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

exports.invokeSdk=async function (org,client,func,args) {
    try {
        // load the network configuration

        const ccpPath = path.resolve(__dirname, '..', '..', 'erc-network', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(client);
        if (!identity) {
            console.log(`An identity for the user ${client} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: client, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('erctokens');

        // Get the contract from the network.
        const contract = network.getContract('erctoken');

        await contract.submitTransaction(func, ...args);
        console.log('Transaction has been submitted');
        
         gateway.disconnect();
        return({status:200,message:"Submitted"})
        
        
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return({status:500,message:"Failed!"})
    }
}