import {  ethers } from 'ethers';
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
const { ethereum } = window;
const getProvider = function (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    return provider;
};
const createContract = function(address,abi,signer){
    const contract = new ethers.Contract(address,abi,signer);
    return contract;

};

const callContractFunc = async function (address,abi,methodName,values,signer) {
  console.log('hq-methodName:',methodName);
  console.log('hq-methodName:',signer);

  const contract = createContract(address,abi,signer);
  console.log(contract);

  let callResult;
  try {
    console.log('callContractFunc-transaction:', contract);
    callResult = await contract[methodName].apply(contract,values);
  } catch (error) {
    console.log('callContractFunc-eror:', error);
    alert(JSON.stringify(error));
  }
  console.log('callResult:', callResult);

  return callResult;

};




const sendContractTx = async function (address,abi,methodName,values, ethValue, signer) {
  let sendResult;
  console.log('send-methodName:',methodName);
  const contract = createContract(address,abi,signer);
  try {

    let overrides = {
      value: ethValue
    }
    let allParams = values;
    if(ethValue !== '0x00'){
      allParams.push(overrides);
    }
    sendResult = await contract[methodName].apply(contract,allParams);
    sendResult = await sendResult.wait();

  } catch (error) {
    console.log('sendContractTx-error:', error);
    alert(JSON.stringify(error));
  }
  console.log('sendResult:', sendResult);
  return sendResult;

};


/*
部署合约
@param bytecode String 合约字节码
@param args Array 在部署合约时传递给构造函数的参数
*/
const deployContract =  async function (bytecode, abi, args) {
  console.log('开始部署合约......');
  const provider = getProvider(ethereum);
  const signer =  provider.getSigner();
  console.log('abi',abi);
  console.log('bytcode',bytecode);
  console.log('args',args);
  let factory =  new ethers.ContractFactory(abi, bytecode,signer);

  let contract = await factory.deploy.apply(factory,args);
  await contract.deployed();
  console.log('部署成功，合约地址：' + contract.address );
  return contract;
}

 const HqUtils= {
    getProvider,
    deployContract,
    createContract,
    filterAbi,
    callContractFunc,
    sendContractTx,
};
export default HqUtils;