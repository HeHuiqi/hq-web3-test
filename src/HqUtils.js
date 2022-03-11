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
  // console.log('types',types);
  // console.log('values',values);
  let callResult;
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
    callResult = await provider.call(transaction);
  } catch (error) {
    console.log('callContractFunc-eror:', error);
    alert(JSON.stringify(error));
  }
  console.log('callResult:', callResult);

  return callResult;

};
const sendContractTx = async function (to,methodName, types, values, ethValue, signer) {
  let data = ethers.utils.hexDataSlice(ethers.utils.id(methodName), 0, 4);

  let sendResult;
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
    sendResult = await signer.sendTransaction(transaction);

  } catch (error) {
    console.log('sendContractTx-:', error);
    alert(JSON.stringify(error));
  }
  console.log('sendResult:', sendResult);
  return sendResult;

};


export const HqUtils= {
    getProvider,
    createContract,
    filterAbi,
    callContractFunc,
    sendContractTx,
};