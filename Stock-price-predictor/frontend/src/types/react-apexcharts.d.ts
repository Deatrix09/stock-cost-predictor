declare module 'react-apexcharts' {
  import { ApexOptions } from 'apexcharts';
  
  interface Props {
    type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
    series: any;
    width?: string | number;
    height?: string | number;
    options?: ApexOptions;
    [key: string]: any;
  }
  
  class ApexChart extends React.Component<Props> {}
  export default ApexChart;
}
