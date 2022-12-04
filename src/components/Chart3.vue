<template>
    <div ref="chart3">
        
    </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';

type EChartsOption = echarts.EChartsOption;
var option: EChartsOption;
const chart3 = ref(null)
var myChart: echarts.ECharts
const props = defineProps({
  height:{
    type:Number,
    default:300
  },
  width:{
    type:Number,
    default:300
  }})
  const colors = ["#3fb1e3",
            "#6be6c1",
            "#626c91",
            "#a0a7e6",
            "#c4ebad",
            "#96dee8","#fff"];
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
  var chartDom = chart3.value!
    myChart = echarts.init(chartDom, "mytheme", { height:fontSize(props.height), width:fontSize(props.width)});
    option && myChart.setOption(option);
}),

option = {
  color:colors,
  title: {
    textStyle:{
      color:"#fff",
    },
    text: 'Nightingale Chart',
    left: 'center'
  },
  grid: {
    width:'auto',
    height:'auto'
  },
  legend: {
    textStyle: { 
     color: "#fff" ,
     fontSize: 12,},
    left: 'center',
    top: 'bottom',
    data: [
      'rose 1',
      'rose 2',
      'rose 3',
      'rose 4',
      'rose 5',
      'rose 6',
      'rose 7',
      'rose 8'
    ]
  },
 
  series: [
    {
      name: 'Radius Mode',
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: {
        borderRadius: 5
      },
      label: {
        show: true,
        color:"#fff",
        fontSize:15
      },
      emphasis: {
        label: {
          show: true,
          
        }
      },
      data: [
        { value: 40, name: 'rose 1' },
        { value: 33, name: 'rose 2' },
        { value: 28, name: 'rose 3' },
        { value: 22, name: 'rose 4' },
        { value: 20, name: 'rose 5' },
        { value: 15, name: 'rose 6' },
        { value: 12, name: 'rose 7' },
        { value: 10, name: 'rose 8' }
      ]
    },
    
  ]
};


</script>

<style scoped>
  div{
    margin: 15px;
  }
</style>