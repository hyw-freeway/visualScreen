<template>
  <div ref="chart2">

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
    default:900
  }})
type EChartsOption = echarts.EChartsOption;
var option: EChartsOption;
var chartDom: any
var myChart: echarts.ECharts
const chart2 = ref(null)
const colors = ["#3fb1e3",
  "#6be6c1",
  "#626c91",
  "#a0a7e6",
  "#c4ebad",
  "#96dee8", "#fff"];
const data2016 = [
  3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7
]
const xdata2016 = ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6', '2016-7', '2016-8', '2016-9', '2016-10', '2016-11', '2016-12']
const data2015 = [
  2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
]
const xdata2015 = ['2015-1', '2015-2', '2015-3', '2015-4', '2015-5', '2015-6', '2015-7', '2015-8', '2015-9', '2015-10', '2015-11', '2015-12']
function addXdata(data: string) {
  var tempn = []
  var temp = data.split('-')
  if (Number(temp[1]) > 11) {
    tempn[0] = Number(temp[0]) + 1
    tempn[1] = 1
    return tempn.join('-')
  } else {
    tempn[0] = Number(temp[0])
    tempn[1] = Number(temp[1]) + 1
    return tempn.join('-')
  }
}
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
  var chartDom = chart2.value!
    myChart = echarts.init(chartDom, "mytheme", { height:fontSize(props.height), width:fontSize(props.width)});
    option && myChart.setOption(option);
}),
window.addEventListener("resize", function() {
  console.log("11111")
    myChart.resize();
    });


option = {
  color: colors,

  tooltip: {
    trigger: 'none',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    textStyle: {
      color: "#fff",
      fontSize: fontSize(20),
    },
  },
  grid: {
    top: fontSize(70),
    bottom: fontSize(50)
  },
  xAxis: [
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        show: true,    //这行代码控制着坐标轴x轴的文字是否显示
        fontSize: fontSize(16)    // x轴字体大小
      },
      axisLine: {
        onZero: false,
        lineStyle: {
          color: colors[1]
        }
      },
      axisPointer: {
        label: {
          formatter: function (params: any) {
            return (
              'Precipitation  ' +
              params.value +
              (params.seriesData.length ? '：' + params.seriesData[0].data : '')
            );
          }
        }
      },
      // prettier-ignore
      data: xdata2016
    },
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        show: true,    //这行代码控制着坐标轴x轴的文字是否显示
        fontSize: fontSize(16)    // x轴字体大小
      },
      axisLine: {
        onZero: false,
        lineStyle: {
          color: colors[0]
        }
      },
      axisPointer: {
        label: {
          formatter: function (params: any) {
            return (
              'Precipitation  ' +
              params.value +
              (params.seriesData.length ? '：' + params.seriesData[0].data : '')
            );
          }
        }
      },

      // prettier-ignore
      data: xdata2015
    }
  ],
  yAxis: [
    {
      type: 'value',
      axisLine: {
        onZero: false,
        lineStyle: {
          color: colors[6],
        },
      },
      axisLabel: {
        show: true,    //这行代码控制着坐标轴x轴的文字是否显示
        color: '#fff',   //x轴上的字体颜色
        fontSize: fontSize(16)    // x轴字体大小
      },
    }

  ],
  series: [
    {
      name: 'Precipitation(2015)',
      type: 'line',
      xAxisIndex: 1,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      data: data2015
    },
    {
      name: 'Precipitation(2016)',
      type: 'line',
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      data: data2016
    }
  ]
};
setInterval(() => {
  data2015.push(Number((Math.random() * 250).toFixed(1)))
  data2016.push(Number((Math.random() * 250).toFixed(1)))
  xdata2015.push(addXdata(xdata2015[xdata2015.length - 1]))
  xdata2016.push(addXdata(xdata2016[xdata2016.length - 1]))
  data2015.shift();
  data2016.shift();
  xdata2015.shift();
  xdata2016.shift();
  option && myChart.setOption(option);
}, 1000)
</script>
<style  scoped>
div{
  margin: .204167rem /* 20/192 */ auto;
}
</style>