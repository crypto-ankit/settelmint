'use strict';

const {Contract} = require('fabric-contract-api');
const crypto = require('crypto')

//objectType for prefix
const allowancePrefix = 'allowance';

//key names for options
const namekey = 'erc20Token';
const symbolKey = 'tokenSymbol'
const decimalKey = 'decimal';
const totalSupplyKey = 'ttlSupply';

class TokenERC20Contract extends Contract {


  /* 
  * Set information for a token and intialize contract.
  * param {String} name The name of the token
  * param {String} symbol The symbol of the token
  * param {String} decimals The decimals used for the token operations
  * @param{Boolean} Return Intialization status of contract
  */

  async SetDetails(ctx, name, symbol, decimals){
    // Check minter authorization - for this contract Org1 is the central banker with privilege to intitialize contract
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to initialize the contract');
    }
    
    await ctx.stub.putState(namekey, Buffer.from(name))
    await ctx.stub.putState(symbolKey, Buffer.from(symbol))
    await ctx.stub.putState(decimalKey, Buffer.from(decimals))

    return true;
  }

/* 
* Checks that contract options have been already initialized
* @param {Context} ctx transaction context
* @returns {Boolean}
*/

async checkInitialized(ctx){
  const nameBytes = await ctx.stub.getState(namekey);
  if(!nameBytes){
    return false
  }
  return true;
}

  /* 
  * Name return the name of the token - example "MyToken"
  * @param {Context} ctx transaction context
  * @returns {String} Returns the name of the token
  */

  async Name(ctx){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const nameBytes = await ctx.stub.getState(namekey);
    if(!nameBytes){
      throw new Error("Unable to fetch token name byte!")
    }
    return nameBytes.toString();
  }

  /* 
  * Name return the name of the token - example "BETH"
  * @param {Context} ctx transaction context
  * @returns {String} Returns the symbol of the token
  */

    async Symbol(ctx){
      const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
      if(!initialized){
        throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
      }
      const symbolBytes = await ctx.stub.getState(symbolKey);
      if(!symbolBytes){
        throw new Error("Unable to fetch symbol byte!")
      }
      return symbolBytes.toString();
    }


  /* 
  * Name return the number of decimals the token uses
  * @param {Context} ctx transaction context
  * @returns {String} Returns the number of decimals
  */

  async Decimals(ctx){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const decimalBytes = await ctx.stub.getState(decimalKey);
    if(!decimalBytes){
      throw new Error("Unable to fetch symbol byte!")
    }
    return decimalBytes.toString();
  }


  /* 
  * Name return total token supply
  * @param {Context} ctx transaction context
  * @returns {String} Returns the total token supply
  */

  async TotalSupply(ctx){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const ttlSplyBytes = await ctx.stub.getState(totalSupplyKey);
    if(!ttlSplyBytes){
      return 0;
    }
    const totalSupply = parseInt(ttlSplyBytes.toString());
    return totalSupply;
  }


  /* 
  * BalanceOf returns the balance of the given account.
  * @param {Context} ctx transaction context
  * @param {String} account The account from which amount will be fetched
  * @returns {Number} Returns balance of the account
  */

  async BalanceOf(ctx, account){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const balanceByte = await ctx.stub.getState(account);
    if(!balanceByte || balanceByte.length === 0){
      throw new Error(`the account ${account} doesn't have balance`)
    }
    const balance = parseInt(balanceByte.toString())
    return balance;
  }



  /* 
  * ClientAccountBalance returns the balance of the requesting client's account.
  * @param {Context} ctx transaction context
  * @returns {Number} Returns the account balance
  */

  async ClientAccountBalance(ctx){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }

    const clientID =  ctx.clientIdentity.getID(); //ID of submitting client identity
    const balanceBytes = await ctx.stub.getState(clientID);
    if(!balanceBytes || balanceBytes.length === 0){
      throw new Error(`the account ${clientID} doesn't exit`)
    }
    const balance = parseInt(balanceBytes.toString())
    return balance;
  }  


  /* 
  * ClientAccountID returns the id of the account of requesting client .
  * the client account ID is the clientId itself.
  * Users can use this function to get their own account id, which they can then give to others as the payment address
  * 
  * @param {Context} ctx transaction context
  */

  async ClientAccountID(ctx){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }

    const clientID =  ctx.clientIdentity.getID(); //ID of submitting client identity
    return clientID;
  }

  /* 
  * Mint creates new tokens and adds them to minter's account balance
  * this function will trigger event for transfer
  * 
  * @param {Context} ctx transaction context
  * @param {Integer} amount the token amount to be minted
  * @returns{Object}
  */  

  async Mint(ctx, amount){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    
    // Check minter authorization -  assume Org1 is the banker with permission to mint new tokens
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to mint new tokens');
    }

    const minter =  ctx.clientIdentity.getID(); // ID of submitting client identity
    const amountInt = parseInt(amount);
    if (amountInt <= 0) {
      throw new Error('mint amount must be a positive integer');
    }

    const currentBalanceBytes = await ctx.stub.getState(minter);
    //If minter current balance doesn't yet exist, then we will assign current balance to 0.
      let currentBalance;
        if (!currentBalanceBytes || currentBalanceBytes.length === 0) {
            currentBalance = 0;
        } else {
            currentBalance = parseInt(currentBalanceBytes.toString());
        }
        let updatedBalance = currentBalance + amountInt;
      await ctx.stub.putState(minter, Buffer.from(updatedBalance.toString()));

    const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
    //If no tokens have been minted, initialize the totalSupply
    let totalSupply;
        if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
            totalSupply = 0;
        } else {
            totalSupply = parseInt(totalSupplyBytes.toString());
        }
        totalSupply = totalSupply + amountInt;
    await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()));

    //Emit Transfer Event
    const transferEvent = { from: '0x0', to: minter, value: amountInt };
    await ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));
    console.log(`minter account ${minter} balance updated from ${currentBalance} to ${updatedBalance}`);
    return true;
  }


  /* 
  * Burn redeem tokens from minter's account balance
  * this function will trigger event for transfer
  * 
  * @param {Context} ctx transaction context
  * @param {Integer} amount the token amount to be burned
  * @returns{Object}
  */
 
  async Burn(ctx, amount){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }

    // Check minter authorization -  assume Org1 is the banker with permission to mint new tokens
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to mint new tokens');
    }

    const minter =  ctx.clientIdentity.getID(); // ID of submitting client identity
    const amountInt = parseInt(amount);
    if (amountInt <= 0) {
      throw new Error('mint amount must be a positive integer');
    }

    const currentBalanceBytes = await ctx.stub.getState(minter);
    // Check if minter current balance exists
    if (!currentBalanceBytes || currentBalanceBytes.length === 0) {
      throw new Error('The balance does not exist');
  }

    let currentBalance = parseInt(currentBalanceBytes.toString());
    const updatedBalance = currentBalance - amountInt;
    await ctx.stub.putState(minter, Buffer.from(updatedBalance.toString()));

    const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
    if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
      throw new Error('totalSupply does not exist.'); // If no tokens have been minted, throw error
    }
    const totalSupply = parseInt(totalSupplyBytes.toString()) - amountInt; // Subtract the burn amount to the total supply and update the state
    await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()));

    //Emit Transfer Event
    const transferEvent = { from: minter, to: '0x0', value: amountInt };
    await ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));
    console.log(`minter account ${minter} balance updated from ${currentBalance} to ${updatedBalance}`);
    return true;
  }


  /* 
  * Transfer transfers tokens from client account to recipient account.
  * recipient account must be a valid clientID
  * This function triggers a Transfer event
  * 
  * @param{Context} ctx the transaction context
  * @param{String} to the recipient
  * @param{Integer} amount The amount of token to be transferred
  * @return{Boolean} Return status of the transaction
  */

  async Transfer(ctx,to,amount){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const from =  ctx.clientIdentity.getID(); //ID of submitting client identity
    console.log("from address is   ", from)
    console.log("to address is   ", to)
    const transferResp = await this.transferHelper(ctx,from,to,amount)
    if(!transferResp){
      throw new Error('Failed to transfer');
    }

    // Emit the Transfer event
    const transferEvent = {from: from,to: to, value: parseInt(amount)};
    await ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));
    return true;
  }


  /* 
  * Allows `spender` to spend `value` amount of tokens from the calling client's token account
  * The spender can withdraw multiple times if necessary, up to the value amount
  * This function triggers an Approval event
  * @param {Context} ctx the transaction context
  * @param {String} spender The spender
  * @param {Integer} value The amount of tokens to be spend or withdraw
  * @returns {Boolean} Return status of approval
  */

  async Approve(ctx,spender,value){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const owner =  ctx.clientIdentity.getID(); //ID of submitting client identity
    
    // Create allowanceKey which is composite key
    const allowanceKey =  ctx.stub.createCompositeKey(allowancePrefix, [owner, spender]);
    let valueInt = parseInt(value);
    await ctx.stub.putState(allowanceKey, Buffer.from(valueInt.toString()));

    //Emit the approval event
    const approvalEvent = { from: owner, to: spender, value: valueInt };
    await ctx.stub.setEvent('Approval', Buffer.from(JSON.stringify(approvalEvent)));
    console.log(`client ${owner} approved the withdrawal of ${value} for spender ${spender}`);
    return true;
  }

  /* 
  * Allowance returns the amount of token still available for the spender to withdraw from the owner
  * @param {Context} ctx the transaction context
  * @param {String} owner The owner of tokens
  * @param {String} spender The spender who are able to transfer the tokens
  * @returns {Number} Return the amount of remaining tokens allowed to spent
  */

  async Allowance(ctx, owner, spender){
    const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const allowanceKey =  ctx.stub.createCompositeKey(allowancePrefix, [owner, spender]);
    const allowanceBytes = await ctx.stub.getState(allowanceKey);
    if (!allowanceBytes || allowanceBytes.length === 0) {
      throw new Error(`spender ${spender} has ${0} allowance available from ${owner}`);
    }
    const allowance = parseInt(allowanceBytes.toString());
    return allowance;
  }

  /* 
  * TransferFrom transfers the amount of token from the "from" address to the "to" address
  * This function triggers a Transfer event
  * 
  * @param {Context} ctx the transaction context
  * @param {String} from The sender
  * @param {String} to The recipient
  * @param {Integer} value The amount of token to be transferred
  * @returns {Boolean} Return status of the transfer
  */
 async TransferFrom(ctx, from, to, value){
  const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const spender =  ctx.clientIdentity.getID(); //ID of submitting client identity

    // Create allowanceKey which is composite key
    const allowanceKey =  ctx.stub.createCompositeKey(allowancePrefix, [from, spender]);
    const currentAllowanceBytes = await ctx.stub.getState(allowanceKey); // Retrieve the allowance of the spender

    if (!currentAllowanceBytes || currentAllowanceBytes.length === 0) {
      throw new Error(`spender ${spender} has no allowance from ${from}`);
    }
    const currentAllowance = parseInt(currentAllowanceBytes.toString());
    const valueInt = parseInt(value);

    // Check if the transferred value is less than the allowance
    if (currentAllowance < valueInt) {
      throw new Error('The spender does not have enough allowance to spend.');
    }

    // Initiate the transfer
    const transferResp = await this.transferHelper(ctx,from,to,valueInt)
    if (!transferResp) {
      throw new Error('Failed to transfer');
    }

    // Decrease the allowance
    const updatedAllowance = currentAllowance - valueInt;
    await ctx.stub.putState(allowanceKey, Buffer.from(updatedAllowance.toString()));
    
    //Emit the approval event
    const approvalEvent = { from, to, value: valueInt };
    await ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(approvalEvent)));
    console.log('transferFrom ended successfully');
    return true;
 }

 /*
  * TransferConditional creates a conditional transfer set to hashlock + timelock 
  * @param {Context} ctx the transaction context
  * @param{String} recipient 
  * @param{Integer} amount
  * @param{Integer} expirationSeconds
  * @param{String} publicKey
  */

async TransferConditional(ctx, recipient, amount, expirationSeconds, password){
  const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to perform this transaction');
    }

    const minter =  ctx.clientIdentity.getID(); // ID of submitting client identity
    const balanceBytes = await ctx.stub.getState(minter);
    if(!balanceBytes || balanceBytes.length === 0){
      throw new Error(`the account ${clientMSPID} doesn't exit`)
    }

  
    // Check that the client cannot transfer more than it's current balance
    let balance = parseInt(balanceBytes.toString());
    if(balance<amount){
      throw new Error(`the account ${clientMSPID} doesn't have enough funds`)
    }

    // Get the transaction creation's timestamp
    let txTime = ctx.stub.getTxTimestamp().seconds.toNumber()
    let expirationSecondsInt = parseInt(expirationSeconds.toString());
    // Set the timelock to the transaction creation's timestamp + the expiration time received
    let timeLock = {ExpirationTime: txTime+expirationSecondsInt, Amount: amount}

    // Set the hashlock
    let hashLock = {Key:password, Recipient: recipient}
    const hash = crypto.createHash('sha256').update(hashLock.Key+"_"+hashLock.Recipient).digest('hex');

    // Create the hashed lock transaction along with it's expiration time and amount to be transfered
    await ctx.stub.putState(hash, Buffer.from(timeLock.ExpirationTime+"_"+timeLock.Amount));
    return hash;
}

 /* 
 * GetHashTimeLock returns the hash time lock
 * @param {Context} ctx the transaction context
 * @param{String} hash the hash for the lock transaction
 * @return hashTimeLock
 */

 async GetHashTimeLock(ctx, hash){
  const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const hashTimeLock = await ctx.stub.getState(hash);
    if(!hashTimeLock||hashTimeLock===0){
      throw new Error("failed to get the hash time lock")
    }
    return hashTimeLock.toString();
 }

 /* 
 * Claim releases the hash time lock and transfers to the "to" address
 * @param {Context} ctx the transaction context
 * @param{string} hash
 * @param{string} password
 * @param{string} recipient
 * @returns{boolean}
 */

 async Claim(ctx,hash,password,recipient){
  const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }

    // Check minter authorization
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to perform this transaction');
    }

    // Get the transaction with hash
    const transaction = await ctx.stub.getState(hash);
    if(!transaction||transaction===0){
      throw new Error("failed to get the hash time lock")
    }
    const tx = transaction.toString().split("_")
    const tx_expirationTime = parseInt(tx[0])
    const tx_amount = parseInt(tx[1])

    // Get the transaction creation's timestamp
    let tx_time = ctx.stub.getTxTimestamp().seconds.toNumber()

    // Check if the time has not expired
    if(tx_time<=tx_expirationTime){
      // If conditions are met, claim the tokens from "recipient"
      const claimHash = crypto.createHash('sha256').update(password+"_"+recipient).digest('hex');
      if(hash!==claimHash){
        throw new Error("failed to release the hashlock")
      }
      // Release the lock and Claim the tokens
    const transferResp = await this.transferHelper(ctx,recipient, clientMSPID, tx_amount)
    if(!transferResp){
      throw new Error('Failed to transfer');
    }
    await ctx.stub.putState(hash, Buffer.from(password));
    }
    return true;
 }

/* Revert releases the hash time lock and transfers to the "from" address 
 * @param {Context} ctx the transaction context
 * @param{string} hash
 * @param{string} origin
*/
 async Revert(ctx,hash,origin){
  const initialized = await this.checkInitialized(ctx) //check if contract has been initialized
    if(!initialized){
      throw new Error("contract is not initialized! Chaincode needs to be initialize first, call Initialize() to initialize the contract")
    }
    const clientMSPID =  ctx.clientIdentity.getMSPID();
    if(clientMSPID !== 'Org1MSP'){
      throw new Error('client is not authorized to perform this transaction');
    }

    // Get the transaction with hash
    const transaction = await ctx.stub.getState(hash);
    if(!transaction||transaction===0){
      throw new Error(`failed to get the transaction with the corresponding hash ${hash}`)
    }
    const tx = transaction.toString().split("_")
    const tx_expirationTime = parseInt(tx[0])
    const tx_amount = parseInt(tx[1])

    // Get the transaction creation's timestamp
    let tx_time = ctx.stub.getTxTimestamp().seconds.toNumber()
    // Check that the time has expired
    if(tx_time>tx_expirationTime){
      // If conditions are met, refund the tokens
    const transferResp = await this.transferHelper(ctx,origin, clientMSPID, tx_amount)
    if(!transferResp){
      throw new Error('failed to refund the token');
    }
    }
 }

 async transferHelper(ctx,from,to,value){
  if(from===to){
    throw new Error('cannot transfer to and from same client account');
  }
  const valueInt = parseInt(value);
  if(valueInt<0){
    throw new Error('transfer amount cannot be negative');
  }
  const fromCurrentBalanceBytes = await ctx.stub.getState(from);
    if(!fromCurrentBalanceBytes || fromCurrentBalanceBytes.length === 0){
      throw new Error(`client ${from} doesnt have balance`)
    }
    const fromCurrentBalance = parseInt(fromCurrentBalanceBytes.toString())
    if(fromCurrentBalance<valueInt){
      throw new Error(`client ${from} have insufficient fund`)
    }

    let toCurrentBalance;
    const toCurrentBalanceBytes = await ctx.stub.getState(to);
    if(!toCurrentBalanceBytes || toCurrentBalanceBytes.length === 0){
      toCurrentBalance=0
    }else{
       toCurrentBalance = parseInt(toCurrentBalanceBytes.toString())
    }
    let fromUpdatedBalance = fromCurrentBalance-valueInt;
    let toUpdatedBalance = toCurrentBalance+valueInt

    await ctx.stub.putState(from, Buffer.from(fromUpdatedBalance.toString()));
    await ctx.stub.putState(to, Buffer.from(toUpdatedBalance.toString()));
    
    return true;  
 }
}

module.exports = TokenERC20Contract;


