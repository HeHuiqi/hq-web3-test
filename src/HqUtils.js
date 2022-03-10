import { BigNumber, ethers } from 'ethers';
import HqRouterAbi from './abi/UNIRouter.json';

const HqRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const filterAbi = function (abi) {
    let res = [];
    for (let index = 0; index < abi.length; index++) {
      const element = abi[index];
      if (element.type === 'function') {
        res.push(element);
      }
    }
    return res;
  }
// const { ethereum } = window;
const getProvider = function (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    return provider;
};
const createContract = function(address,abi,signer){
    const contract = new ethers.Contract(address,abi,signer);
    return contract;

};
 const testGetAmountOut = async function () {
    const provider = getProvider();
    const signer = provider.getSigner();
    const contract = createContract(HqRouterAddress,HqRouterAbi,signer);
    let out = await contract.functions['getAmountOut'].apply(contract,['100','1000','500']);
    out  = JSON.parse(JSON.stringify(out[0]));
    console.log('out:',out);
};

export const HqUtils= {
    getProvider,
    createContract,
    filterAbi,
};