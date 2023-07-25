import {create, getAll} from '../repositories/index.js';
import Token from '../models/Token.js';
import redisClient from '../config/redis.js';

class EnterpriseService {
    createNewEnterprise = async (body) => {
        const {name, symbol, deployedAddress, network, image} = body;

        const newEnterprise= await create(Token, {
            name,
            symbol,
            deployedAddress,
            network,
            image
        });

        const enterprisesCache = JSON.parse(await redisClient.get('enterprises')); 
        enterprisesCache.push(newEnterprise);
        await redisClient.set('enterprises', JSON.stringify(enterprisesCache))
        await redisClient.set(newEnterprise._id.toString(), 'true')

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