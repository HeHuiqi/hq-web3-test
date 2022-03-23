import { useState } from 'react';
import { useParams } from "react-router-dom";

import './HqDeployContract.css';
import HqUtils from './HqUtils';


function HqDeployContract() {
  const [inputBytecode, setInputBytecode] = useState('');
  const [inputAbi, setInputAbi] = useState('');
  const [deployAddress, setDeployAddress] = useState('');
  const [constructParams, setConstructParams] = useState('');



  //获取路由参数
  const params = useParams();

  const bytecodeInputChange = function(event){
    const value = event.target.value;
    if(value){
      setInputBytecode(value);
    }
  };
  const abiInputChange = function(event){
    const value = event.target.value;
    if(value){
      setInputAbi(value);
    }
  }
  const startDeployContract = async function(){
    console.log('startDeployContract-befroe');
    if(inputBytecode && inputAbi){
        try {
            let args = JSON.parse(constructParams);
            const contract = await HqUtils.deployContract(inputBytecode,JSON.parse(inputAbi),args);
            setDeployAddress(contract.address);
        } catch (error) {
            console.log('startDeployContract-error:',error);
        }
        
    }
  };
  const constructInputChange = function (event){
    const value = event.target.value;
    console.log('value:',value);
    if(value){
        setConstructParams(value);
    }
  }
  return (
    <div className="HqDeployContract">
      <h2>Account:{params.currentAccount}</h2>

      <div className='inputDataTag'>
        <p>输入Bytecode</p>
        <textarea id='bytecodeInputTag'   defaultValue={inputBytecode} onChange={bytecodeInputChange} ></textarea>
        <p>输入Abi</p>
        <textarea id='abiInputTag'   defaultValue={inputAbi} onChange={abiInputChange} ></textarea>
        <p>construct params example: ["HqToken","HQT",18]</p> 
        <input  placeholder='请输入' onChange={constructInputChange} defaultValue={constructParams}/>

      </div>
      <p><button onClick={startDeployContract} > deploy </button></p>
      <div className='deployResult'>
        <p>部署地址: {deployAddress}</p>
      </div>
    </div>
  );
}

export default HqDeployContract;
