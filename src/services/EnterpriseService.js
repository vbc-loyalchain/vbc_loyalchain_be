import {create} from '../repositories/crud';
import Token from '../models/Token';
import providers from '../config/providers'
import {ERC20TokenContract} from '../config/contract/ERC20Token'

class EnterpriseService {
    createNewEnterprise = async (body) => {
        const {name, symbol, network, image, admins, privateKey} = body;

        const provider = providers[network];

        const accountToDeploy = provider.getAccount(privateKey);

        const {contractAddress} = await provider.deploySC(
            ERC20TokenContract.abi,
            ERC20TokenContract.bytecode,
            [name, symbol, admins],
            accountToDeploy.address,
            privateKey
        )

        const newEnterprise= await create(Token, {
            name,
            symbol,
            deployedAddress: contractAddress,
            network,
            image
        });

        return newEnterprise;
    }
}

export default new EnterpriseService()