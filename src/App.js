import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import { Link } from 'react-router-dom';

import './App.css';
import HqNetworks from './HqNetworks';
import HqUtils from './HqUtils';

import HqMusicAbi from './abi/HqMusic.json';
import HqERC20Abi from './abi/ERC20.json';
import HqRouterAbi from './abi/UniswapV2Router02.json';
import HqFactoryAbi from './abi/UniswapV2Factory.json';
import HqPairAbi from './abi/UniswapV2Pair.json'
import HqMultiCallAbi  from './abi/Multicall.json'


// https://rinkeby.etherscan.io/address/0xc7ad46e0b8a400bb3c915120d284aafba8fc4735#code dai
const HqDaiAddress = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735";

// https://rinkeby.etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#readContract
const HqRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';


// https://rinkeby.etherscan.io/address/0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f#code
const HqFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';


// https://rinkeby.etherscan.io/address/0xe897f96867953673a2fd264b7003aa7dcd780e54#readContract
const HqMusicAddress = "0xe897f96867953673a2fd264b7003aA7dcD780e54";


// https://testnet.bscscan.com/address/0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576#code
const HqMultiCallAddress = '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'

const { ethereum } = window;

const getProvider = function () {
  if (ethereum) {
    const provider = HqUtils.getProvider(ethereum);
    return provider;
  }
  return null
};


let initAddress = HqDaiAddress;
let initAbi = HqERC20Abi;

const publickAbiInfo = {
  abiArray:[HqERC20Abi,HqRouterAbi,HqFactoryAbi,HqPairAbi,HqMusicAbi,HqMultiCallAbi],
  addressArray:[HqDaiAddress,HqRouterAddress,HqFactoryAddress,'',HqMusicAddress,HqMultiCallAddress]
};
function PublickAbiList(props){
  let items = [] ;
  let abiNameList = ["ERC20Abi","UniswapV2Router02Abi","UniswapV2Factory","UniswapV2PairAbi","HqMusicAbi","MultiCallAbi"];
  const onSelectAbiChange = function (event) {
    console.log('onSelectAbiChange:',event.target.selectedIndex);
    props.onSelectAbiChange(event.target.selectedIndex);
  }
  for (let i = 0; i < abiNameList.length; i++) {
    const abiName = abiNameList[i]
    items.push(<option className='selectItem' key={i} value={abiName}  >{abiName}</option>)
  }
  return (
    <div>
      <select  onChange={onSelectAbiChange}  >  {items} </select>
    </div>
  );
}

function ContractMethodsList(props) {

  let items = [];
  const onSelectMethodChange = function (event) {
    props.onSelectMethodChange(event.target.selectedIndex);
    console.log('onSelectMethodChange:',event.target.value);
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
      <select id='selectMethodTag' onChange={onSelectMethodChange}  >  {items} </select>
    </div>
  );
};

function InputPanel(props) {
  const inputChange = function (event) {
    // //console.log('event.target.value:',event.target.index);
    const key = 'value-' + event.target.name;
    props.inputChange(key, event.target.value);
  }
  var items = [];
  let i = 0;
  let inputs = props.method.inputs;

  const inputItem = function(key,paramType,indexName){
    return(
      <div key={key}> 
        <p>{paramType}</p> 
        <input className='userInput' lable={paramType} placeholder='请输入' onChange={inputChange} name={indexName} />
      </div>
    );
  };

  for (i; i < inputs.length; i++) {
    const inputP = inputs[i];
    const paramType = inputP.name + '(' + inputP.type + ')'
    const tag = inputItem(i,paramType,i);
    items.push(tag)

  }
  if (props.isClearInput) {
    const userInputs = document.getElementsByClassName('userInput');
    for (let index = 0; index < userInputs.length; index++) {
      const element = userInputs[index];
      element.value = '';
    }
  }

  if (props.method.stateMutability === 'payable') {
    const inputP = {
      name: 'payEth',
      type: 'uint256',
    };
    const paramType = inputP.name + '(' + inputP.type + ')'
    let tag = inputItem(i,paramType,i);
    items.push(tag);
  }
  return (
    <div>
      {items}
    </div>
  );
}

function App() {

  const [currentAccount, setCurrentAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [ContractAbi, setContractAbi] = useState(HqUtils.filterAbi(initAbi));
  const [contractAddress, setContractAddress] = useState(initAddress);
  const [selecteIndex, setSelecteIndex] = useState(0);
  const [inputParams, setInputParams] = useState({});
  const [clearInputValue, setClearInputValue] = useState(false);
  const [exeResult, setExeResult] = useState();

  // 监听账户和网络的改变
  if (ethereum) {
    ethereum.on('accountsChanged', (accounts) => {
      console.log('accountsChanged,',accounts[0]);

      if (accounts.length !== 0) {
        const account = accounts[0];
        //console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
      }
    });
    ethereum.on('chainChanged', (chainId) => {
      // console.log(ethereum);
      console.log('chainChanged-chainId',chainId, HqNetworks[chainId]);
      const netName = HqNetworks[chainId] ? HqNetworks[chainId].name : 'Unknown';
      setNetworkName(netName);
      connectWalletHandler();
    });
  }
  // 检查是否连接钱包
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Make sure you have Metamask installed!");
      return;
    }
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    const netName = HqNetworks[ethereum.chainId] ? HqNetworks[ethereum.chainId].name : 'Unknown';
    setNetworkName(netName);
    if (accounts.length !== 0) {
      const account = accounts[0];
      //console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      //console.log("No authorized account found");
    }
  }
  // 连接钱包
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

  //abi 变化
  const onSelectAbiChange = function (index) {
    console.log('app-onSelectAbiChange:',index);
    
    let abi = publickAbiInfo.abiArray[index];
    abi = HqUtils.filterAbi(abi);
    const address = publickAbiInfo.addressArray[index];
    
    const inputAbiTag = document.getElementById('inputAbiTag');
    inputAbiTag.value = JSON.stringify(abi);
    const inputAddressTag = document.getElementById('inputAddressTag');
    inputAddressTag.value = address;

    setContractAbi(abi);
    resetInitState();
    setContractAddress(address);

  }
  // 方法改变
  const onSelectMethodChange = function (selectedIndex) {
    setSelecteIndex(selectedIndex);
    setInputParams({});
    setExeResult('')
    setClearInputValue(true);

  };

  const resetInitState = function () {
    setSelecteIndex(0);
    setInputParams({});
    setClearInputValue(true);
    setExeResult('')
  };
  // abi 输入变化
  const onAbiChange = function (event) {

    console.log('onAbiChange');
    const value = event.target.value;
    if (value) {
      try {
        let abi = JSON.parse(value);
        abi = HqUtils.filterAbi(abi);
        setContractAbi(abi);
        resetInitState();
        setContractAddress('');
      } catch (error) {
        
      }
    }

  };
  const onAddressChange = function (event) {
    const value = event.target.value;
    if (value) {
      setContractAddress(value);
      resetInitState();
    }
  }
  // 开始执行方法
  const exeContrantMethod = async function () {
    setExeResult('');
    setClearInputValue(false);

    const methodInfo = ContractAbi[selecteIndex];
    let method = methodInfo.name;
    console.log('method:','function', method,methodInfo.stateMutability);
    console.log('inputParams:', inputParams);
    let params = [];
    // ["0x1f9840a85d5af5bf1d1762f925bdaddc4201f984","0xc778417e063141139fce010982780140aa0cd5ab"]

    Object.keys(inputParams).forEach(function (key) {
      let value = inputParams[key];
      // 解析输入的数组参数
      if(value.indexOf('[') === 0){
        value = JSON.parse(value);
      }
      params.push(value);
    });


    const provider = getProvider();
    if (methodInfo.stateMutability === 'view' || methodInfo.stateMutability === 'pure') {

      if (provider) {
        const callRes = await HqUtils.callContractFunc(contractAddress,ContractAbi,method,params, provider.getSigner());
        if (callRes === '0x') {
          alert('亲选择正确的网络测试');
        } else {
          let res = {result:callRes.toString()};
          setExeResult(JSON.stringify(res));

        }

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
            const lastParam = params.pop();
            ethValue = BigNumber.from(lastParam).toHexString();
          }
          nftTxn = await HqUtils.sendContractTx(contractAddress,ContractAbi,method, params, ethValue, signer);
        } else {
          nftTxn = await HqUtils.sendContractTx(contractAddress,ContractAbi,method,params, ethValue, signer);
        }
        if(nftTxn){
          const explorer = HqNetworks[ethereum.chainId].explorer;
          const txUrl = `${explorer}/${nftTxn.hash}`;
          console.log('txUrl:', txUrl);
          const txLink = <a href={txUrl}>交易查询</a>
          setExeResult(txLink);
        }

      }

    }


  };

  const inputChange = function (key, value) {
    let params = inputParams;
    params[key] = value;
    setInputParams(params);
  }

  // console.log('ContractAbi:',ContractAbi);

  return (
    <div className='App'>
  
      {currentAccount ? '' : connectWalletButton()}
      <h2>Account：{currentAccount}</h2>
      <h4>Network：<span className='showNetwork'>{networkName}</span></h4>
      <p className="deployLink">
        <Link to={`/deploy/${currentAccount}`}>Deploy Contract</Link>
      </p>

      <PublickAbiList onSelectAbiChange={onSelectAbiChange}/>
      <div className='contractInfo'>
        <p>输入Abi</p>
        <textarea id='inputAbiTag' rows="15" cols="100" defaultValue={JSON.stringify(ContractAbi)}  onChange={onAbiChange}>
        </textarea>
        <p>输入合约地址</p>
        <input id='inputAddressTag' type="text" placeholder='合约地址' defaultValue={contractAddress} onChange={onAddressChange} />
        <p>方法列表</p>
        <ContractMethodsList methods={ContractAbi} selecteIndex={selecteIndex} onSelectMethodChange={onSelectMethodChange} />
        <InputPanel method={ContractAbi[selecteIndex]} isClearInput={clearInputValue} inputChange={inputChange} />

      </div>

      <div className='exeOperate'>
        <button onClick={exeContrantMethod}>执行合约方法</button>
      </div>
      <p className='txResult' >结果：{exeResult}</p>

    </div>
  )
}

export default App;
