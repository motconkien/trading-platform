import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";

export default function MidPriceChart({ tickData, newPoint }) {
  const [series, setSeries] = useState([{ name: "Mid Price", data: [] }]);
  const mountedRef = useRef(false);

  // Ref to store the latest series for smooth updates

  // Load initial history
  useEffect(() => {
    if (!tickData || tickData.length === 0) return;

    const midPrice = tickData.map(tick => ({
      x: new Date(tick.time || tick.date).getTime(),
      y: parseFloat(((tick.bid + tick.ask) / 2).toFixed(5)),
    }));

    setSeries([{ name: "Mid Price", data: midPrice }]);
    mountedRef.current = true;
  }, [tickData]);

  // Append new point smoothly
  console.log("DEBUG1: ",newPoint);
  useEffect(() => {
    if (!newPoint || !newPoint.time) return;

    console.log("DEBUG2: ask: ",newPoint.ask, "bid: ", newPoint.bid);
    const point = {
      x: new Date(newPoint.time).getTime(),
      y: (parseFloat(newPoint.ask + newPoint.bid)/2).toFixed(5),
    };

    // Update the local series ref
    console.log("DEBUG3: ", point);
    // Append to ApexCharts
    ApexCharts.exec("realtime", "appendData", [
      { data: [point] },
    ]);
  }, [newPoint]);

  const options = {
    chart: {
      id: "realtime", // must match exec()
      type: "line",
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
    stroke: { curve: "smooth", width: 4 },
    colors: ["#0ea1d2ff"],
    title: { text: "Price Trending", align: "center", style: { fontSize: "20px" } },
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="line" height={400} />
    </div>
  );
}


export function SwapChart({ swapData }) {
  const [series, setSeries] = useState([
    { name: "Swap Long", data: [] },
    { name: "Swap Short", data: [] }
  ]);

  useEffect(() => {
    if (!swapData || swapData.length === 0) return;

    const swapLong = swapData.map(tick => ({
      x: new Date(tick.time || tick.date).getTime(),
      y: parseFloat(parseFloat(tick.swaplong).toFixed(5))
    }));

    const swapShort = swapData.map(tick => ({
      x: new Date(tick.time || tick.date).getTime(),
      y: parseFloat(parseFloat(tick.swapshort).toFixed(5))
    }));

    setSeries([
      { name: "Swap Long", data: swapLong },
      { name: "Swap Short", data: swapShort }
    ]);
  }, [swapData]);

  const options = {
    chart: {
      id: "realtime",
      type: "line",
      height: 400,
      zoom: { autoScaleYaxis: true },
      animations: { enabled: true, easing: "linear", dynamicAnimation: { speed: 1000 } }
    },
    dataLabels: { enabled: false },
    xaxis: { type: "datetime" },
    yaxis: { opposite: false },
    tooltip: { x: { format: "dd MMM yyyy HH:mm:ss" } },
    stroke: { curve: "smooth", width: 4 },
    colors: ["#4dff0067", "#FF4500"],
    title: { text: "Swap Rates Over Time", align: "center" }
  };

  return (
    <div id="chart-swap">
      <ReactApexChart options={options} series={series} type="line" height={400} />
    </div>
  );
}