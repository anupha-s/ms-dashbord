<template>
  <div class="card">
    <div class="label">ยอดจองสิทธิ์ตามผู้จำหน่าย</div>
    <Chart :option="option" height="320px" :autoHover="true" :hoverEveryMs="6000" />
  </div>
</template>

<script setup lang="ts">
import Chart from './Chart.vue';
const props = defineProps<{ dealers: string[], values: number[] }>();
const option = {
  grid:{left:130,right:20,top:20,bottom:30},
  xAxis:{type:'value'},
  yAxis:{type:'category', data: props.dealers},
  series:[{type:'bar', data: props.values}],
  tooltip:{trigger:'axis'}
};
</script>
