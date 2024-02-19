'use strict'


const express = require('express')
const router = express.Router()

const Erc20Token = require('../controllers/controller')
const EnrollAdmin = require('../controllers/enrollAdmin')
const RegisterUser = require('../controllers/registerUser')


router.get('/enrollAdmin/:org',EnrollAdmin.enrollAdmin)
router.get('/registerUser/:org/:user',RegisterUser.registerUser)
router.post('/mint',Erc20Token.Mint);
router.post('/ubrn',Erc20Token.Burn);
router.post('/transfer',Erc20Token.Transfer);
router.post('/approve',Erc20Token.Approve);
router.post('/allowance',Erc20Token.Allowance);
router.post('/transferFrom',Erc20Token.TransferFrom);
router.post('/transferConditional',Erc20Token.TransferConditional);
router.post('/claim',Erc20Token.Claim);
router.post('/revert',Erc20Token.Revert);
router.post('/balanceOf', Erc20Token.BalanceOf)
router.get('/getHashTimeLock', Erc20Token.GetHashTimeLock)

router.get('/geTName/:org/:user', Erc20Token.geTName)
router.get('/decimal/:org/:user', Erc20Token.Decimals)
router.get('/symbol/:org/:user', Erc20Token.Symbol)
router.get('/totalSupply/:org/:user', Erc20Token.TotalSupply)
router.get('/clientAccountBalance/:org/:user', Erc20Token.ClientAccountBalance)
router.get('/clientAccountID:org/:user', Erc20Token.ClientAccountID)

module.exports = router;