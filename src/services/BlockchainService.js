import Web3 from "web3";
// import { Transaction as Tx } from '@ethereumjs/tx';
// import { Common, Hardfork } from "@ethereumjs/common";
// import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

export default class BlockchainService {
    WEB3;
    chainId;
    gasPrice;
    maxFeePerGas;

    constructor(RPC, chainId, gasBasePrice) {
        this.WEB3 = new Web3(
            new Web3.providers.HttpProvider(RPC)
        );
        this.chainId = chainId;
        this.gasPrice = gasBasePrice; 
        this.maxFeePerGas = gasBasePrice; 
    }

    getAccount = (privateKey) => {
        return this.WEB3.eth.accounts.privateKeyToAccount(privateKey);
    }

    createRaw = async (ABI, SCA, funcName="", params=[], from="", value=0) => {

        const contractDeployed = new this.WEB3.eth.Contract(
            JSON.parse(JSON.stringify(ABI)),
            SCA
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
            to: SCA,
            gasLimit,
            gasPrice: this.gasPrice,
            nonce: nonce,
            data: dataFunc,
            value: value
        };

        return rawTx;
    }

    // signRaw = async (rawTx = {}, privateKey) => {

    //     privateKey = Buffer.from(privateKey, "hex");

    //     const transaction = new Tx(rawTx, {chainId: this.chainId});

    //     const signedTx = "0x" + transaction.sign(privateKey).serialize().toString("hex");

    //     return signedTx;
    // }

    getBaseFeePerGas = async () => {
    
        const block = await this.WEB3.eth.getBlock("pending");
      
        const baseFeePerGas = block.baseFeePerGas;
      
        return baseFeePerGas;
    }

    createRawEIP1559 = async (ABI, SCA, funcName="", params=[], from="", value=0, maxPriorityFeePerGas="0x00") => {

        const contractDeployed = new this.WEB3.eth.Contract(
            JSON.parse(JSON.stringify(ABI)),
            SCA
        );

        const dataFunc = contractDeployed.methods[funcName](
            ...params
        ).encodeABI();

        const gasLimit = await contractDeployed.methods[funcName](
            ...params
        ).estimateGas({from});

        const nonce = await this.WEB3.eth.getTransactionCount(from);

        const rawTx = {
            from,
            to: SCA,
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

//     signRawEIP1559 = async (rawTx = {}, privateKey) => {

//         privateKey = Buffer.from(privateKey, "hex");

//         const common = Common.custom({ chainId: this.chainId }, {hardfork: Hardfork.London});

//         let transaction = FeeMarketEIP1559Transaction.fromTxData(rawTx, { common });

//         transaction = transaction.sign(privateKey);

//         const signedTx = "0x" + transaction.serialize().toString("hex");

//         return signedTx;
//    }

   signData = (paramsObj, privateKey) => {
        const message = this.WEB3.utils.soliditySha3(...paramsObj);
        const {signature} = this.WEB3.eth.accounts.sign(message,privateKey);
        return signature;
   }

    createRawDeploySC = async (ABI, bytecode="", params=[], from="",value=0) => {

        let contract = new this.WEB3.eth.Contract(JSON.parse(JSON.stringify(ABI)));

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
            //to: "0x0000000000000000000000000000000000000000",
            nonce: this.WEB3.utils.toHex(nonce),
            gasLimit: this.WEB3.utils.toHex(gasLimit),
            gasPrice: this.WEB3.utils.toHex(this.gasPrice),
            data,
            value: this.WEB3.utils.toHex(value)
        };

        return rawTx;
    }

    createRawDeploySCEIP1559 = async (ABI, bytecode="", params=[], from="",value=0, maxPriorityFeePerGas="0x00") => {

        let contract = new this.WEB3.eth.Contract(JSON.parse(JSON.stringify(ABI)));

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
            //to: "0x0000000000000000000000000000000000000000",
            nonce: this.WEB3.utils.toHex(nonce),
            gasLimit: this.WEB3.utils.toHex(gasLimit),
            maxPriorityFeePerGas,
            maxFeePerGas: this.maxFeePerGas,
            data,
            value: this.WEB3.utils.toHex(value),
            type: "0x02",
            accessList: []
        };

        return rawTx;
    }

    // sendSignedRaw = async (signedTx) => {
    //     const txHash = this.WEB3.utils.keccak256(signedTx);

    //     const tx = await this.WEB3.eth.sendSignedTransaction(signedTx);

    //     return {txHash, tx};
    // }

    getReceipt = (txHash) => {
        const receipt = this.WEB3.eth.getTransactionReceipt(txHash);
        return receipt;
    }

    getCode = async (address) => {
        const code = await this.WEB3.eth.getCode(address);
        return code;
    }

    callFunc = async (ABI, SCA, funcName="", params=[], from="") => {
        let contract = new this.WEB3.eth.Contract(
            JSON.parse(JSON.stringify(ABI)),
            SCA
        )

        const value = await contract.methods[funcName](
            ...params
        ).call({from})

        return value;
    }

    // makeTransactionEIP1559 = async (ABI, SCA, funcName="", params=[], from="", privateKey, value=0, maxPriorityFeePerGas="0x00") => {
    //     const rawTx = await this.createRawEIP1559(ABI, SCA, funcName, params, from, value, maxPriorityFeePerGas);

    //     const signedTx = await this.signRawEIP1559(rawTx, privateKey.slice(2));

    //     const {tx} = await this.sendSignedRaw(signedTx);

    //     return tx;
    // }

    // deploySC = async (ABI, bytecode="", params=[], from="", privateKey, value=0, maxPriorityFeePerGas="0x00") => {

    //     const rawTx = await this.createRawDeploySCEIP1559(ABI, bytecode, params, from, value, maxPriorityFeePerGas);

    //     const signedTx = await this.signRawEIP1559(rawTx, privateKey.slice(2));

    //     const {tx} = await this.sendSignedRaw(signedTx);

    //     return tx;
    // }
}