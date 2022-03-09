import { useEffect, useState } from 'react';
import './App.css';
import { BigNumber, ethers } from 'ethers';
import networks from './HqNetworks';
import HqMusicAbi from './abi/HqMusic.json';
import HqDaiAbi from './abi/Dai.json';
import HqGardenAbi from './abi/Garden.json'
import HqRouterAbi from './abi/UNIRouter.json';

// https://rinkeby.etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#readContract
const HqRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// https://rinkeby.etherscan.io/address/0xe897f96867953673a2fd264b7003aa7dcd780e54#readContract
const HqMusicAddress = "0xe897f96867953673a2fd264b7003aA7dcD780e54";

// https://rinkeby.etherscan.io/address/0xc7ad46e0b8a400bb3c915120d284aafba8fc4735#code dai
const HqDaiAddress = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735";

// https://testnet.bscscan.com/address/0xAc79cf53C72b47c1478D340D435e28907426D01E#code
const HqGardenAddress = '0xAc79cf53C72b47c1478D340D435e28907426D01E'


const { ethereum } = window;
if (ethereum) {
  ethereum.on('accountsChanged', (accounts) => {
    console.log('accountsChanged');
    window.location.reload();
  });
  ethereum.on('chainChanged', (chainId) => {
    console.log('chainChanged');
    window.location.reload();
  });
}

const getProvider = function () {
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    // console.log('getProvider-provider:',provider);
    return provider;
  }
  return null
};




let initAddress = HqMusicAddress;
let initAbi = HqMusicAbi;
let testChoose = 2;
switch (testChoose) {
  case 1:
    initAddress = HqDaiAddress;
    initAbi = HqDaiAbi;
    break;
  case 2:
    initAddress = HqRouterAddress;
    initAbi = HqRouterAbi;
    break;
  case 3:
    initAddress = HqGardenAddress;
    initAbi = HqGardenAbi;
    break;


  default:
    break;
}





function ContractMethodsList(props) {

  let items = [];
  const onSelectMethodChange = function (event) {
    props.onSelectMethodChange(event.target.selectedIndex);
  }
  const methods = props.methods;
  let defaultMethond = methods[props.selecteIndex]
  console.log('selectMethod:', JSON.stringify(defaultMethond));

  for (let i = 0; i < methods.length; i++) {
    const method = methods[i]
    items.push(<option className='selectItem' key={i} value={JSON.stringify(method)}  >{method.name}</option>)
  }
  return (
    <div>
      <select id='selectMethodTag' onChange={onSelectMethodChange} value={JSON.stringify(defaultMethond)} >  {items} </select>
    </div>
  );
};

function InputPanel(props) {
  //console.log(props.inputs);

  const inputChange = function (event) {
    // //console.log('event.target.value:',event.target.index);
    const key = 'value-' + event.target.name;
    props.inputChange(key, event.target.value);
  }
  var items = [];
  let i = 0;
  let inputs = props.method.inputs;

  for (i; i < inputs.length; i++) {
    const inputP = inputs[i];
    const param = inputP.name + '(' + inputP.type + ')'
    let tag = <p key={i}> {param}: <input placeholder='请输入' onChange={inputChange} name={i} /> </p>;
    items.push(tag)
  }
  if (props.method.stateMutability === 'payable') {
    const inputP = {
      name: 'payEth',
      type: 'uint256',
    };
    const param = inputP.name + '(' + inputP.type + ')'
    let tag = <p key={i}> {param}: <input placeholder='请输入' onChange={inputChange} name={i} /> </p>;
    items.push(tag);
  }
  return (
    <div>
      {items}
    </div>
  );
}

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

function App() {

  const [currentAccount, setCurrentAccount] = useState('');
  const [networkName, setNetworkName] = useState('Rinkeby');

  const [ContractAbi, setContractAbi] = useState(filterAbi(initAbi));
  const [contractAddress, setContractAddress] = useState(initAddress);
  const [selecteIndex, setSelecteIndex] = useState(0);
  const [inputParams, setInputParams] = useState({});
  const [exeResult, setExeResult] = useState();


  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Make sure you have Metamask installed!");
      return;
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.log('ethereum:', ethereum);
    setNetworkName(networks[ethereum.chainId].name);
    if (accounts.length !== 0) {
      const account = accounts[0];
      //console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      //console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      //console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      //console.log('connectWalletHandler-err:', err)
    }
  }

  const sendContractTx = async function (methodName, types, values, ethValue, signer) {
    let data = ethers.utils.hexDataSlice(ethers.utils.id(methodName), 0, 4);
    let params = ethers.utils.defaultAbiCoder.encode(types, values); // 0x00dgjkdsgg000.....
    if (values.length > 0) {
      data = data + params.slice(2);
    }
    const transaction = {
      to: contractAddress,
      value: ethValue,
      data: data
    };

    let sendPromise = await signer.sendTransaction(transaction);
    console.log('sendPromise:', sendPromise);
    return sendPromise;

  };
  const callContractFunc = async function (methodName, types, values, provider) {
    let data = ethers.utils.hexDataSlice(ethers.utils.id(methodName), 0, 4);
    if (values.length > 0) {
      let params = ethers.utils.defaultAbiCoder.encode(types, values); // 0x0777999....

      data = data + params.slice(2);
    }
    let transaction = {
      to: contractAddress,
      data: data
    };
    console.log('callContractFunc-transaction:', transaction);
    let callRes = await provider.call(transaction);
    console.log('callRes:', callRes);

    return callRes;

  };


  // 连接matemask
  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler}>
        Connect Wallet
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  const onSelectMethodChange = function (selectedIndex) {
    setSelecteIndex(selectedIndex);
    setInputParams({});
    setExeResult('')
  };

  const onAbiChange = function (event) {
    const value = event.target.value;
    if (value) {
      let abi = JSON.parse(value);
      abi = filterAbi(abi);
      setContractAbi(abi);
      setSelecteIndex(0);
      setInputParams({});
      setExeResult('')
    }

  };
  const onAddressChange = function (event) {
    const value = event.target.value;
    if (value) {
      setContractAddress(value);
      setInputParams({});
      setExeResult('')
    }
  }

  const formatCallResult = function (result, outputs) {
    let showRes = [];
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      const haha = JSON.parse(JSON.stringify(element));
      if (haha.type === 'BigNumber') {
        let outName = '';
        if (index < outputs.length) {
          const output = outputs[index];
          outName = output.name;
        }
        const ele = {
          name: outName,
          type: 'BigNumber',
          value: element.toString(),
        }
        showRes.push(ele);
      } else {
        showRes.push(element);
      }
    }
    return showRes;
  };

  const exeContrantMethod = async function () {
    const selectMethodTag = document.getElementById('selectMethodTag');
    const methodInfo = ContractAbi[selectMethodTag.selectedIndex];
    console.log('methodInfo.stateMutability:', methodInfo.stateMutability);
    let inputs = '';
    let outputs = '';
    for (let i = 0; i < methodInfo.inputs.length; i++) {
      const inputItem = methodInfo.inputs[i];
      inputs = inputs + ',' + inputItem.type;
    }
    for (let i = 0; i < methodInfo.outputs.length; i++) {
      const outpuItem = methodInfo.outputs[i];
      outputs = outputs + ',' + outpuItem.type;
    }
    let method = methodInfo.name + '(' + inputs.slice(1) + ')';
    console.log('method:', method);
    console.log('inputParams:', inputParams);
    let params = [];
    Object.keys(inputParams).forEach(function (key) {
      params.push(inputParams[key]);
    });

    const provider = getProvider();
    if (methodInfo.stateMutability === 'view') {
      if (provider) {
        const inputTypes = inputs.split(',').slice(1);
        const callRes = await callContractFunc(method, inputTypes, params, provider);
        const outputTypes = outputs.split(',').slice(1);
        let res = ethers.utils.defaultAbiCoder.decode(outputTypes, callRes);
        res = formatCallResult(res, methodInfo.outputs);
        setExeResult(JSON.stringify(res));
      }
    } else {
      if (provider) {
        const signer = provider.getSigner();
        let ethValue = '0x00';
        let nftTxn = { hash: '0x00' };
        if (methodInfo.stateMutability === 'payable') {
          const pLen = params.length;
          if (pLen === 1) {
            params = [];
            ethValue = BigNumber.from(params[0]).toHexString();
          } else {
            params = params.slice(0, pLen - 1);
            ethValue = BigNumber.from(params[pLen - 1]).toHexString();
          }
          nftTxn = await sendContractTx(method, inputs.split(',').slice(1), params, ethValue, signer)
        } else {
          nftTxn = await sendContractTx(method, inputs.split(',').slice(1), params, ethValue, signer)
        }
        const explorer = networks[ethereum.chainId].explorer;
        const txUrl = `${explorer}/${nftTxn.hash}`;
        console.log('txUrl:', txUrl);
        const txLink = <a href={txUrl}>交易查询</a>
        setExeResult(txLink);
      }

    }


  };

  const inputChange = function (key, value) {
    let params = inputParams;
    params[key] = value;
    setInputParams(params);
  }

  return (
    <div className='App'>
      {currentAccount ? '' : connectWalletButton()}
      <h2>Account:{currentAccount}</h2>
      <h4>Network:<span className='showNetwork'>{networkName}</span></h4>

      <div className='contractInfo'>
        <p>输入Abi</p>
        <textarea rows="15" cols="100" defaultValue={JSON.stringify(ContractAbi)} onChange={onAbiChange}>
        </textarea>
        <p>输入合约地址</p>
        <input type="text" placeholder='合约地址' defaultValue={contractAddress} onChange={onAddressChange} />
        <p>方法列表</p>
        {ContractAbi ? <ContractMethodsList methods={ContractAbi} selecteIndex={selecteIndex} onSelectMethodChange={onSelectMethodChange} /> : ''}
        {ContractAbi ? <InputPanel method={ContractAbi[selecteIndex]} inputChange={inputChange} /> : ''}

      </div>

      <div className='exeOperate'>
        <button onClick={exeContrantMethod}>执行合约方法</button>
      </div>
      <p className='txResult' >结果：{exeResult}</p>
    </div>
  )
}

export default App;
