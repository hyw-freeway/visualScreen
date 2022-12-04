<template>
    <div ref="chart5">
        
    </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';
const props = defineProps({
  height:{
    type:Number,
    default:300
  },
  width:{
    type:Number,
    default:990
  }})
type EChartsOption = echarts.EChartsOption;
var option: EChartsOption;
var myChart: echarts.ECharts
const chart5 = ref(null)
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
const dataCount = 5e5;
const data = generateData(dataCount);
const colors = ["#3fb1e3",
            "#6be6c1",
            "#626c91",
            "#a0a7e6",
            "#c4ebad",
            "#96dee8","#fff"];
onMounted(() => {
  var chartDom = chart5.value!
    myChart = echarts.init(chartDom, undefined, { height:fontSize(props.height), width:fontSize(props.width)});
    option && myChart.setOption(option);
}),
window.addEventListener("resize", function() {
  console.log("111")
    myChart.resize();
    });
option = {
  color:colors,
  title: {
    text: echarts.format.addCommas(dataCount) + ' Data',
    left: fontSize(10),
    textStyle:{
      color:'#fff'
    }
  },
  
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    bottom: fontSize(90)
  },
  dataZoom: [
    {
      type: 'inside'
    },
    {
      type: 'slider'
    }
  ],
  xAxis: {
    data: data.categoryData,
    silent: false,
    axisLine: {
        show: true,
        lineStyle: {
          color: colors[6]
        }
      },
    splitLine: {
      show: false
    },
    splitArea: {
      show: false
    }
  },
  yAxis: {
    axisLine: {
        show: true,
        lineStyle: {
          color: colors[6]
        }
      },
    splitArea: {
      show: false
    }
  },
  series: [
    {
      type: 'bar',
      data: data.valueData,
      // Set `large` for large data amount
      large: true
    }
  ]
};

function generateData(count: number) {
  let baseValue = Math.random() * 1000;
  let time = +new Date(2021, 0, 1);
  let smallBaseValue: number;

  function next(idx: number) {
    smallBaseValue =
      idx % 30 === 0
        ? Math.random() * 700
        : smallBaseValue + Math.random() * 500 - 250;
    baseValue += Math.random() * 20 - 10;
    return Math.max(0, Math.round(baseValue + smallBaseValue) + 3000);
  }

  const categoryData = [];
  const valueData = [];
  const timelist = []

  for (let i = 0; i < count; i++) {
    timelist.push(time)
    categoryData.push(
      echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', time, false)
    );
    valueData.push(next(i).toFixed(2));
    time += 1000;
  }

  return {
    categoryData: categoryData,
    valueData: valueData,
    timelist: timelist
  };
};
</script>

<style scoped>
  div{
  margin: .152083rem /* 10/192 */ auto;
}
</style>