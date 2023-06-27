import {create, getAll} from '../repositories/crud';
import Token from '../models/Token';
import providers from '../config/providers'
import {ERC20TokenContract} from '../config/contract/ERC20Token'
import redisClient from '../config/redis';

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

        const enterprisesCache = JSON.parse(await redisClient.get('enterprises')); 
        enterprisesCache.push(newEnterprise);
        await redisClient.set('enterprises', JSON.stringify(enterprisesCache))
        await redisClient.set(newEnterprise._id, 'true')

        return newEnterprise;
    }

    getAllEnterprise = async () => {
        const enterprisesCache = await redisClient.get('enterprises');
        if(enterprisesCache) {
            return JSON.parse(enterprisesCache);
        }
        else{
            const allEnterprise = await getAll(Token, {})
            await redisClient.set('enterprises', JSON.stringify(allEnterprise));
            return allEnterprise;
        }
    }
}

export default new EnterpriseService()