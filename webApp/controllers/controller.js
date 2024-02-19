'use strick'

const invokeSdk = require('../helper/invokeSdk');
const querySdk = require('../helper/querySdk');


exports.geTName = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "Name" 
  let result = await querySdk.querySdk(org,client,func);
  res.json(result)
}

exports.Decimals = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "Decimals" 
  let result = querySdk.querySdk(org,client,func);
  res.json(result)
}


exports.Symbol = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "Symbol" 
  let result = querySdk.querySdk(org,client,func);
  res.json(result)
}

exports.TotalSupply = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "TotalSupply" 
  let result = querySdk.querySdk(org,client,func);
  res.json(result)
}

exports.BalanceOf = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "BalanceOf"
  let arg = [req.body.account] 
  let result = querySdk.querySdk(org,client,func,arg);
  res.json(result)
}

exports.ClientAccountBalance = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "ClientAccountBalance"
  let result = querySdk.querySdk(org,client,func);
  res.json(result)
}

exports.ClientAccountID = async function(req,res){
  const org = req.params.org;
  const client = req.params.user;
  const func = "ClientAccountID"
  let result = querySdk.querySdk(org,client,func);
  res.json(result)
}

exports.Mint = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Mint"
  let arg = [req.body.amount] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.Burn = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  console.log(org,client)
  const func = "Mint"
  let arg = [req.body.amount] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.Transfer = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Mint"
  let arg = [req.body.to,req.body.amount] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.Approve = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Approve"
  let arg = [req.body.spender,req.body.value] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.Allowance = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Allowance"
  let arg = [req.body.owner,req.body.spender] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.TransferFrom = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "TransferFrom"
  let arg = [req.body.from, req.body.to, req.body.value] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.TransferConditional = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "TransferConditional"
  let arg = [req.body.recipient, req.body.amount, req.body.expirationSeconds, req.body.password] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.GetHashTimeLock = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "GetHashTimeLock" 
  let arg = [req.body.hash]
  let result = querySdk.querySdk(org,client,func,arg);
  res.json(result)
}

exports.Claim = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Claim"
  let arg = [req.body.hash, req.body.password, req.body.recipient] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}

exports.Revert = async function(req,res){
  const org = req.body.org;
  const client = req.body.user;
  const func = "Revert"
  let arg = [req.body.hash, req.body.origin] 
  let result = invokeSdk.invokeSdk(org,client,func,arg);
  res.json(result)
}
