import BlockchainService from "../services/blockchainService.js";
import blockchainNetwork from "./blockchainNetwork.js";

export default {
    4444: new BlockchainService(blockchainNetwork.AGD.RPC, blockchainNetwork.AGD.chainId, '0x00'),
    8888: new BlockchainService(blockchainNetwork.MBC.RPC, blockchainNetwork.MBC.chainId, '0x00')
}