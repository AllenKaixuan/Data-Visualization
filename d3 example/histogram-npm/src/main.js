'use strict';

import scatter from "./scatter.js"
import weekschedule from "./week.js"
import * as d3 from "d3";

import stack from "./assets/industry.csv";
import schedule from "./assets/week.csv";


scatter();

d3.csv(schedule).then((data, error) => { 
  if (error) {
    console.log(error);
  } else {
    // console.log(data);

    for(let i=0;i<data.length;i++){
      data[i].date = new Date(data[i].date);
      
    }

    weekschedule(data,{
      width: 1000,
      height: 500,
      
    })
  };
}); 