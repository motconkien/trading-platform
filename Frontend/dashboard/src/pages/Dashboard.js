import { AreaSeries, BarSeries, BaselineSeries, createChart, CrosshairMode } from 'lightweight-charts';
import React, { useRef, useEffect } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';




function Dashboard() {
    // const chartContainerRef = useRef();
    // const chart = useRef();
    // const resizeObserver = useRef();

    // useEffect(() => {
    //     chart.current = createChart(chartContainerRef.current, {
    //         width: chartContainerRef.current.clientWidth,
    //         height: chartContainerRef.current.clientHeight,
    //         layout: {
    //             backgroundColor: '#253248',
    //             textColor: 'rgba(255, 255, 255, 0.9)',
    //         },
    //         grid: {
    //             vertLines: {
    //                 color: '#334158',
    //             },
    //             horzLines: {
    //                 color: '#334158',
    //             },
    //         },
    //         crosshair: {
    //             mode: CrosshairMode.Normal,
    //         },
    //         priceScale: {
    //             borderColor: '#485c7b',
    //         },
    //         timeScale: {
    //             borderColor: '#485c7b',
    //         },
    //     });

    //     console.log(chart.current);

    //     const candleSeries = chart.current.addCandlestickSeries({
    //         upColor: '#4bffb5',
    //         downColor: '#ff4976',
    //         borderDownColor: '#ff4976',
    //         borderUpColor: '#4bffb5',
    //         wickDownColor: '#838ca1',
    //         wickUpColor: '#838ca1',
    //     });

    //     candleSeries.setData(priceData);

    //     const volumeSeries = chart.current.addHistogramSeries({
    //         color: '#182233',
    //         lineWidth: 2,
    //         priceFormat: {
    //             type: 'volume',
    //         },
    //         overlay: true,
    //         scaleMargins: {
    //             top: 0.8,
    //             bottom: 0,
    //         },
    //     });

    //     volumeSeries.setData(volumeData);
    // }, []);

    // // Resize chart on container resizes.
    // useEffect(() => {
    //     resizeObserver.current = new ResizeObserver(entries => {
    //         const { width, height } = entries[0].contentRect;
    //         chart.current.applyOptions({ width, height });
    //         setTimeout(() => {
    //             chart.current.timeScale().fitContent();
    //         }, 0);
    //     });

    //     resizeObserver.current.observe(chartContainerRef.current);

    //     return () => resizeObserver.current.disconnect();
    // }, []);

    // return (
    //     <div className="dashboard-page">
    //         <div ref={chartContainerRef} className="chart-container" style={{ width: '600px', height: '400px' }}/>
    //     </div>
    // );
}
export default Dashboard;