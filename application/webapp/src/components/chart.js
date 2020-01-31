import React from 'react';

import { Chart } from "react-google-charts";

function ChartTemple(props) {
    return(
        <Chart
            chartType={props.type}
            width="95%"
            height="400px"
            loader="loading"
            data = {props.data}
            options={{
            title: props.title,
            hAxis: {
                title: 'Month',
                minValue: 0,
            },
            vAxis: {
                title: '',
            },
            }}
            legendToggle
        />
    )
  }
export default ChartTemple;