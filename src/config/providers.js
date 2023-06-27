import BlockchainService from "../services/blockchainService.js";
import blockchainNetwork from "./blockchainNetwork.js";

export default {
    AGD: new BlockchainService(blockchainNetwork.AGD.RPC, blockchainNetwork.AGD.chainId, '0x02'),
    MBC: new BlockchainService(blockchainNetwork.MBC.RPC, blockchainNetwork.MBC.chainId, '0x02')
}