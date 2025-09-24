<template>
  <div ref="refEl" :style="{width, height}"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';

const props = withDefaults(defineProps<{
  option: any;
  width?: string;
  height?: string;
  autoHover?: boolean;
  hoverEveryMs?: number;
}>(), {
  width: '100%',
  height: '240px',
  autoHover: false,
  hoverEveryMs: 6000
});

const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;
let timer: any = null;
let pausedUntil = 0;
let lastIndex = -1;

function render(){
  if(!refEl.value) return;
  if(!chart) {
    chart = echarts.init(refEl.value);
    chart.on('mouseover', ()=> { pausedUntil = Date.now() + props.hoverEveryMs * 2; });
  }
  chart.setOption(props.option, true);
  setupAutoHover();
}

function downplayAll(index:number){
  if(!chart) return;
  const opt = chart.getOption();
  // For category charts (bar/line): downplay all series for given dataIndex
  if (opt.series && Array.isArray(opt.series) && opt.series.length){
    opt.series.forEach((s: any, i:number)=>{
      chart!.dispatchAction({ type: 'downplay', seriesIndex: i, dataIndex: index });
    });
  }
  // For pie, also downplay the rest
  chart.dispatchAction({ type: 'hideTip' });
}

function autoStep(){
  if(!chart) return;
  if(Date.now() < pausedUntil) return;
  const opt:any = chart.getOption();
  if(!opt.series || !opt.series.length) return;
  const first:any = opt.series[0];
  let len = 0;
  if (first.type === 'pie') {
    len = (first.data && first.data[0] && first.data[0].value !== undefined) ? first.data.length : (first[0]?.data?.length || 0);
  } else {
    len = (first.data && first.data.length) || 0;
  }
  if(len === 0) return;

  const nextIndex = (lastIndex + 1) % len;

  // Clear previous highlight
  if(lastIndex >= 0){
    downplayAll(lastIndex);
  }

  // Highlight + tooltip
  if (first.type === 'pie') {
    chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: nextIndex });
    chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: nextIndex });
  } else {
    // highlight all series on the same axis dataIndex
    opt.series.forEach((s:any, i:number)=>{
      chart!.dispatchAction({ type: 'highlight', seriesIndex: i, dataIndex: nextIndex });
    });
    chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: nextIndex });
  }
  lastIndex = nextIndex;
}

function setupAutoHover(){
  if(!props.autoHover) { clearInterval(timer); timer=null; return; }
  clearInterval(timer);
  timer = setInterval(autoStep, props.hoverEveryMs);
}

onMounted(async ()=>{
  await nextTick(); render();
  window.addEventListener('resize', ()=> chart && chart.resize());
});
onBeforeUnmount(()=> { chart && chart.dispose(); clearInterval(timer); });
watch(()=>props.option, ()=> render(), {deep: true});
watch(()=>props.autoHover, ()=> setupAutoHover());
watch(()=>props.hoverEveryMs, ()=> setupAutoHover());
</script>
