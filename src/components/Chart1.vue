<template>
    <div ref="chart1">
        
    </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';
const props = defineProps({
  height:{
    type:Number,
    default:330
  },
  width:{
    type:Number,
    default:930
  }})
type EChartsOption = echarts.EChartsOption;
var option: EChartsOption;
const colors = ["#3fb1e3",
            "#6be6c1",
            "#626c91",
            "#a0a7e6",
            "#c4ebad",
            "#96dee8","#fff"];
const chart1 = ref(null)
var myChart:echarts.ECharts
function fontSize(res: number) {
  let docEl = document.documentElement,
    clientWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
  if (!clientWidth) return;
  // 此处的3840 为设计稿的宽度，记得修改！
  let fontSize = clientWidth / 1920;
  return res * fontSize;
}
onMounted(() => {
  var chartDom = chart1.value!
    myChart = echarts.init(chartDom, "mytheme", { height:fontSize(props.height), width:fontSize(props.width)});
    option && myChart.setOption(option);
}),

option = {
  color: colors,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  grid: {
    top:'15%',
    right: '20%'
  },
  legend: {
    data: ['Evaporation', 'Precipitation', 'Temperature'],
    top:fontSize(10),
    textStyle: { 
      color: "#fff" ,
      fontSize: fontSize(20),},
  },
  xAxis: [
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {  
        show: true,    //这行代码控制着坐标轴x轴的文字是否显示
        fontSize:fontSize(16)    // x轴字体大小
        },
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[6]
        }
      },
      // prettier-ignore
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Evaporation',
      position: 'right',
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[0]
        }
      },
      axisLabel: {
        fontSize:fontSize(16),
        formatter: '{value} ml',
      }
    },
    {
      type: 'value',
      name: 'Precipitation',
      position: 'right',
      alignTicks: true,
      offset: fontSize(80),
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[1]
        }
      },
      axisLabel: {
        formatter: '{value} ml'
      }
    },
    {
      type: 'value',
      name: '温度',
      position: 'left',
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[6]
        }
      },
      axisLabel: {
        formatter: '{value} °C'
      }
    }
  ],
  series: [
    {
      name: 'Evaporation',
      type: 'bar',
      data: [
        2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
      ]
    },
    {
      name: 'Precipitation',
      type: 'bar',
      yAxisIndex: 1,
      data: [
        2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
      ]
    },
    {
      name: 'Temperature',
      type: 'line',
      yAxisIndex: 2,
      data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
    }
  ]
};
</script>
<style  scoped>
 div{
  margin: .204167rem /* 20/192 */ auto;
}
</style>