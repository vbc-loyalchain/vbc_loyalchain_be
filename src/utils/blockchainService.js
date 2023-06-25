import Web3 from "web3";
import {Transaction as Tx} from '@ethereumjs/tx'
import {Common, Hardfork} from '@ethereumjs/common'
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

export default class BlockchainService {
    WEB3;
    chainId;
    SCA;
    gasPrice;
    ABI;
    maxFeePerGas;

    constructor(RPC, chainId, SCA, ABI, gasBasePrice) {
        this.WEB3 = new Web3(
            new Web3.providers.HttpProvider(RPC)
        );
        this.chainId = chainId;
        this.gasPrice = gasBasePrice; 
        this.SCA = SCA;
        this.ABI = ABI;
        this.maxFeePerGas = gasBasePrice; 
    }

    createRaw = async (funcName="", params=[], from="", value=0) => {
      
        const ABI = JSON.parse(JSON.stringify(this.ABI));

        const contractDeployed = new this.WEB3.eth.Contract(
            ABI,
            this.SCA
        );

        const dataFunc = contractDeployed.methods[funcName](
            ...params
        ).encodeABI();

        const gasLimit = await contractDeployed.methods[funcName](
            ...params
        ).estimateGas({ from });

        const nonce = await this.WEB3.eth.getTransactionCount(from);

        const rawTx = {
            from,
            to: this.SCA,
            gasLimit,
            gasPrice: this.gasPrice,
            nonce: nonce,
            data: dataFunc,
            value: value
        };

        return rawTx;
    }

    signRaw = async (rawTx = {}, privateKey) => {

        privateKey = Buffer.from(privateKey, "hex");

        const transaction = new Tx(rawTx, {chainId: this.chainId});

        const signedTx = "0x" + transaction.sign(privateKey).serialize().toString("hex");

        return signedTx;
    }

    getBaseFeePerGas = async () => {
    
        const block = await this.WEB3.eth.getBlock("pending");
      
        const baseFeePerGas = block.baseFeePerGas;
      
        return baseFeePerGas;
    }

    createRawEIP1559 = async (funcName="", params=[], from="", value=0, maxPriorityFeePerGas="0x01") => {
        const ABI = JSON.parse(JSON.stringify(this.ABI));

        const contractDeployed = new this.WEB3.Contract(
            ABI, 
            this.SCA
        );

        const dataFunc = contractDeployed.methods[funcName](
            ...params
        ).encodeABI();

        const nonce = contractDeployed.methods[funcName](
            ...params
        ).estimateGas({from});

        const rawTx = {
            from,
            to: this.SCA,
            gasLimit,
            maxPriorityFeePerGas,
            maxFeePerGas: this.maxFeePerGas,
            nonce: nonce,
            data: dataFunc,
            value: value,
            type: "0x02",
            accessList: []
        };

        return rawTx;
    }

    signRawEIP1559 = async (rawTx = {}, privateKey) => {

        privateKey = Buffer.from(privateKey, "hex");

        const common = Common.custom({ chainId: this.chainId }, {hardfork: Hardfork.London});

        let transaction = FeeMarketEIP1559Transaction.fromTxData(rawTx, { common });

        transaction = transaction.sign(privateKey);

        const signedTx = "0x" + transaction.serialize().toString("hex");

        return signedTx;
   }

    createRawDeploySC = async (bytecode="", params=[],from="",value=0) => {
        const ABI = JSON.parse(JSON.stringify(this.ABI));

        let contract = new this.WEB3.eth.Contract(ABI);

        const data = contract.deploy({
            data: bytecode,
            arguments: params
        }).encodeABI();

        const gasLimit = await contract.deploy({
            data: bytecode,
            arguments: params
        }).estimateGas({from});

        const nonce = await this.WEB3.eth.getTransactionCount(from);

        const rawTx = {
            from, 
            to: "0x0000000000000000000000000000000000000000",
            nonce: this.WEB3.utils.toHex(nonce),
            gasLimit: this.WEB3.utils.toHex(gasLimit),
            gasPrice: this.WEB3.utils.toHex(this.gasPrice),
            data,
            value: this.WEB3.utils.toHex(value)
        };

        return rawTx;
    }

    sendSignedRaw = async (signedTx) => {
        const txHash = this.WEB3.utils.keccak256(signedTx);

        const tx = await this.WEB3.eth.sendSignedTransaction(signedTx);

        return {txHash, tx};
    }

    getReceipt = (txHash) => {
        const receipt = this.WEB3.eth.getTransactionReceipt(txHash);
        return receipt;
    }
}