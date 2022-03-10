import { render, screen } from '@testing-library/react';



const formatParamTypes = function(types){
  let newTypes = types.map((currentValue)=>{
      return currentValue + 2;
  });

  console.log('pop:',newTypes.pop());
  console.log('newTypes:',newTypes.toString());
  
};

test('renders learn react link', () => {
 
  console.log('App.test.js 这里 写测试代码');
  let ps = [1,2,3,4,5];
  formatParamTypes(ps);
});
