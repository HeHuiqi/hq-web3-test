
import {useState } from 'react';
import './AppCaculate.css';

// import { BigNumber, ethers } from 'ethers';

function AppCaculate() {
    
    const [currentDate,setCurrentDate] =useState(new Date());
    const refreshDate = function(){
        const date = new Date();
        setCurrentDate(date);
    };
    return(
        <div className='AppCaculate'>
            <h2>计算区域</h2>
            <h4>时间戳：{currentDate.getTime()} ms</h4>
            <button onClick={refreshDate} >刷新时间</button>
            <div className='caculateInputInfo'>
                <p>swap</p>
                
            </div>
        </div>
    );
}

export default AppCaculate;