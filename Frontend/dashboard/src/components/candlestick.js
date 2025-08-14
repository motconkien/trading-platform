import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

export default function MidPriceChart({ tickData }) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!tickData || tickData.length === 0) return;

    const midPrice = tickData.map(tick => ({
      x: new Date(tick.date).getTime(),
      y: (((tick.bid) + (tick.ask)) / 2).toFixed(5)
    }));

    setSeries([{ name: "Mid Price", data: midPrice }]);
  }, [tickData]);

  const options = {
    chart: { id: 'area-datetime', type: 'area', height: 350, zoom: { autoScaleYaxis: true } },
    dataLabels: { enabled: false },
    markers: { size: 0, style: 'hollow' },
    xaxis: { type: 'datetime' },
    yaxis: { opposite: true},
    tooltip: { x: { format: 'dd MMM yyyy HH:mm:ss' } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] } },
    colors: ['#00BFFF'],
    legend: { position: 'top' }
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" height={400} />
    </div>
  );
}
