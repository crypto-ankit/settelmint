Prerequisite

Hyperledger Fabric v2.2.x
Hyperledger Fabric CA v1.5.x
Docker Docker version 25.0.3
Docker-Compose v2.24.5	
NodeJS v18.12.0
npm 8.19.2
curl 8.2.1

Hyperledger Fabric network

The Hyperledger fabric network consist of

One orderer
orderer.example.com
Two organizations
MSPID: Org1MSP
One peer:
peer0.org1.example.com

MSPID: Org2MSP
One peer:
peer0.org2.example.com

Two CouchDB state database deployment for each peer
Fabric CA
ca.org1.example.com

Fabric CLI

Install hyperledger binary file from below link or can pull from hypeledger fabric github repository
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.15 1.5.9

Set PATH environmental variabel

Deploying the network it will create a channel, peers orderer, CA , cli, couchdb container, and cryptographic material of all entities.
./network.sh up createChannel -ca -c erctokens -s couchdb

I have created 3 users for performing transactiions, two users(Minter and Alice) for organization1 and one(Bob) for organization. Commands are available in
registerEnroll.sh file --- available isnide fabric-ca folder

Run npm install inside chaicode folder, I have used javascript for smart contract
npm install

Use below command for javascript chaincode deployment
./network.sh deployCC -c erctokens -ccn erctoken -ccp ../chaincode/erc20token/ -ccl javascript

set the FABRIC_CFG_PATH to point to the core.yaml, for using hlf binary and perfrm operations with this binary. Set it on your working directory
export FABRIC_CFG_PATH=$PWD/../config/

Performing transactions using commands, I have developed webApp too but for now I am performing using commands.

Open terminal 1
Mint the token. we can invoke the smart contract to mint some tokens. set the following environment variables to operate the peer CLI as the minter identity from Org1.
I have created one minter user in organization 1

export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/minter@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

Insert details for the token, need to do only one time
peer chaincode invoke $TARGET_TLS_OPTIONS -C erctokens -n erctoken -c '{"function":"SetDetails","args":["bethErcToken",  "BETH", "5"]}'

Invoke Mint chaincode function to mint the token with below command
peer chaincode invoke $TARGET_TLS_OPTIONS -C erctokens -n erctoken -c '{"function":"Mint","Args":["5000"]}'

Transfer token to the user of org2, bob user. I am taking bob as recipient. For transfer I need clientaccountID of bob
Open terminal 2 and set below environment variable organization2

export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:9051


Using the Org2 terminal, the Org2 recipient user can retrieve their own account ID:
peer chaincode query -C erctokens -n erctoken -c '{"function":"ClientAccountID","Args":[]}'
It will return recipient client ID in below format
"x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=bob::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"

After the Org2 recipient provides their account ID to the minter, the minter can initiate a transfer from their account to the recipient's account(Bob). Back in the Org1 terminal, request the transfer of 100 tokens to the recipient account:
peer chaincode invoke $TARGET_TLS_OPTIONS -C erctokens -n erctoken -c '{"function":"Transfer","Args":[ "'"$RECIPIENT"'","1000"]}'

in the Org1 terminal, let's request the minter's account balance again:, will return remaining amount at minters account.
peer chaincode query -C erctokens -n erctoken -c '{"function":"ClientAccountBalance","Args":[]}'

using the Org2 terminal, let's request the recipient's balance:
peer chaincode query -C erctokens -n erctoken -c '{"function":"ClientAccountBalance","Args":[]}'



3rd Party Transfer
In chaincode I have implemented a funtion TransferFrom, which allows an approved 3rd party spender to transfer fungible tokens on behalf of the account owner. It will explain how to approve the spender and transfer fungible tokens.
*minter client uses the Approve function to set the allowance of tokens a spender client can transfer on behalf of the minter.
*The spender client will then use the TransferFrom function to transfer the requested number of tokens to the recipient's account on behalf of the minter. 

Now Open Terminal 3, in this terminal set environmental variable of org1 since I have created two users in org1 so 2nd user(Alicec) of org1 will become the 3rd party spender and minter client has to approve this user first.
Set enviroment variable using below commands

export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Alice@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

Approve a spender
The minter intends to approve 500 tokens to be transferred by the spender, but first the spender needs to provide their own client ID as the payment address.
Run Below command to obtain client id of user2 (Alice) for getting approval from minter
peer chaincode query -C erctokens -n erctoken -c '{"function":"ClientAccountID","Args":[]}'

After the Org1 spender(Alice) provides their client ID to the minter, the minter can approve a spender. Back in the Org1 minter terminal, request the approval of 500 tokens to be withdrawn by the spender.
peer chaincode invoke $TARGET_TLS_OPTIONS -C erctokens -n erctoken -c '{"function":"Approve","Args":["'"$SPENDER"'", "1000"]}'


The approve function specified that the spender client can transfer 500 tokens on behalf of the minter. We can check the spender client's allowance from the minter by calling the allowance function.
Let's request the spender's allowance from the Org1 minter terminal.
peer chaincode query -C erctokens -n erctoken -c '{"function":"Allowance","Args":["'"$MINTER"'", "'"$SPENDER"'"]}'

TransferFrom tokens
The spender intends to transfer 100 tokens to the Org2 recipient on behalf of the minter. The spender has already got the minter client Id and the recipient client ID.
Back in the 3rd terminal, request the transfer of 100 tokens to the recipient account.

export MINTER="x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=minter::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com"
export RECIPIENT="x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=bob::/C=UK/ST=Hampshire/L=Hursley/O=org2.example.com/CN=ca.org2.example.com"

peer chaincode invoke $TARGET_TLS_OPTIONS -C erctokens -n erctoken -c '{"function":"TransferFrom","Args":[ "'"$MINTER"'", "'"$RECIPIENT"'", "500"]}'

While still in the 3rd terminal for the spender, let's request the minter's account balance again:

peer chaincode query -C erctokens -n erctoken -c '{"function":"BalanceOf","Args":["'"$MINTER"'"]}'