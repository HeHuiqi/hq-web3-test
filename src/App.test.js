
import HqRouterAbi from './abi/UNIRouter.json';

const HqRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

 const testGetAmountOut = async function (signer) {
    const contract = createContract(HqRouterAddress,HqRouterAbi,signer);
    let out = await contract.functions['getAmountOut'].apply(contract,['100','1000','500']);
    out  = JSON.parse(JSON.stringify(out[0]));
    console.log('out:',out);
};

const obj = {

  goRun: function(speed,action){
   console.log('speed:',speed);
   console.log('action:',action); 
  }
};

const formatParamTypes = function(types){
  let newTypes = types.map((currentValue)=>{
      return currentValue + 2;
  });

  console.log('pop:',newTypes.pop());
  console.log('newTypes:',newTypes.toString());
  
};

test('renders learn react link', () => {
 
  console.log('App.test.js 这里 写测试代码');
  // let ps = [1,2,3,4,5];
  // formatParamTypes(ps);
  // obj['goRun'].call(obj,3,5,6);
  // obj['goRun'].bind(obj,3,5,6)();
  obj['goRun'].apply(obj,[3,5,6]);


});
