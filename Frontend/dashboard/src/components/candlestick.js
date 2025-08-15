import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";

export default function MidPriceChart({ tickData, newPoint }) {
  const [series, setSeries] = useState([]);
  const chartMounted = useRef(false);

  // Ref to store the latest series for smooth updates
  const seriesRef = useRef([]);

  // Load initial history
  useEffect(() => {
    if (!tickData || tickData.length === 0) return;

    const midPrice = tickData.map(tick => ({
      x: new Date(tick.time || tick.date).getTime(),
      y: parseFloat(((tick.bid + tick.ask) / 2).toFixed(5)),
    }));

    setSeries([{ name: "Mid Price", data: midPrice }]);
    seriesRef.current = midPrice;
  }, [tickData]);

  // Mark chart as mounted
  useEffect(() => {
    chartMounted.current = true;
  }, []);

  // Append new point smoothly
  useEffect(() => {
    if (!chartMounted.current) return;
    if (!newPoint || !newPoint.time) return;

    const point = {
      x: new Date(newPoint.time).getTime(),
      y: parseFloat(((newPoint.bid + newPoint.ask) / 2).toFixed(5)),
    };

    // Update the local series ref
    seriesRef.current = [...seriesRef.current, point];
    console.log("DEBUG: ", point);
    // Append to ApexCharts
    ApexCharts.exec("area-datetime", "appendData", {
      data: [point],
    });
  }, [newPoint]);

  const options = {
    chart: {
      id: "area-datetime",
      type: "area",
      height: 400,
      zoom: { autoScaleYaxis: true },
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: { speed: 200 },
      },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, style: "hollow" },
    xaxis: { type: "datetime" },
    yaxis: { opposite: true },
    tooltip: { x: { format: "dd MMM yyyy HH:mm:ss" } },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] },
    },
    colors: ["#00BFFF"],
    legend: { position: "top" },
    title: { text: "Price Trending", align: "center", style: { fontSize: "20px" } },
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" height={400} />
    </div>
  );
}
