import { BigNumber, ethers } from 'ethers';
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


const callContractFunc = async function (to,methodName, types, values, provider) {
  let data = ethers.utils.hexDataSlice(ethers.utils.id(methodName), 0, 4);

  let callRes;
  try {
    if (values.length > 0) {
      let params = ethers.utils.defaultAbiCoder.encode(types, values); // 0x0777999....
      data = data + params.slice(2);
    }
    let transaction = {
      to: to,
      data: data
    };
    console.log('callContractFunc-transaction:', transaction);
    callRes = await provider.call(transaction);
  } catch (error) {
    console.log('callContractFunc-eror:', error);
    alert(error);
  }
  console.log('callRes:', callRes);

  return callRes;

};
const sendContractTx = async function (to,methodName, types, values, ethValue, signer) {
  let data = ethers.utils.hexDataSlice(ethers.utils.id(methodName), 0, 4);

  let sendPromise;
  try {
    let params = ethers.utils.defaultAbiCoder.encode(types, values); // 0x00dgjkdsgg000.....
    if (values.length > 0) {
      data = data + params.slice(2);
    }
    const transaction = {
      to: to,
      value: ethValue,
      data: data
    };
    sendPromise = await signer.sendTransaction(transaction);

  } catch (error) {
    console.log('sendContractTx-:', error);
    alert(JSON.stringify(error));
  }
  console.log('sendPromise:', sendPromise);
  return sendPromise;

};


export const HqUtils= {
    getProvider,
    createContract,
    filterAbi,
    callContractFunc,
    sendContractTx,
};