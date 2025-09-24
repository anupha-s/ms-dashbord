<template>
  <div class="container grid" style="gap:16px">
    <h2>Mazda Sales Thailand – Pre-Registration</h2>

    <Filters :options="options" v-model="filters" @apply="apply" />

    <div class="grid" style="grid-template-columns: 1.1fr 1fr;">
      <KPI :total="filtered.length" :months="monthSeries" />
      <PackagePie :items="pkgPie" />
    </div>

    <div class="grid" style="grid-template-columns: 1fr 1fr;">
      <StackedColor :categories="colorCats" :black="colorBlack" :tan="colorTan" />
      <DealerBar :dealers="byDealer.labels" :values="byDealer.values" />
    </div>

    <DataTable
      :items="paged.items"
      :page="page"
      :totalPages="paged.totalPages"
      @change-page="page=$event"
      @export-excel="exportExcel"
      @view="onView"
    />

    <DetailModal :open="showDetail" v-if="selected" :record="selected" @close="showDetail=false; selected=null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import Filters from './components/Filters.vue';
import KPI from './components/KPI.vue';
import StackedColor from './components/StackedColor.vue';
import DealerBar from './components/DealerBar.vue';
import PackagePie from './components/PackagePie.vue';
import DataTable from './components/DataTable.vue';
import DetailModal from './components/DetailModal.vue';

// Load data
import jsonData from './data/mock.json';
import { mockData as fallback } from './data/mock';
import { uniq, groupBy, withinRange, paginate, formatDateTime } from './utils';
import type { Prebooking } from './types';

const base: Prebooking[] = (jsonData?.prebookings?.length ? jsonData.prebookings : fallback) as unknown as Prebooking[];
const raw = ref<Prebooking[]>(base);

// --- Compute data min/max ---
const dataMin = raw.value.length ? dayjs(Math.min(...raw.value.map(r => dayjs(r.bookingAt).valueOf()))) : dayjs();
const dataMax = raw.value.length ? dayjs(Math.max(...raw.value.map(r => dayjs(r.bookingAt).valueOf()))) : dayjs();

// Effective "today" for default display = max(วันนี้, วันที่ล่าสุดในข้อมูล)
const realToday = dayjs();
const initialFrom = dataMin.startOf('day').format('YYYY-MM-DD');
const initialTo   = (dataMax.isAfter(realToday) ? dataMax : realToday).startOf('day').format('YYYY-MM-DD');

// --- Filters default ---
const filters = ref({ from: initialFrom, to: initialTo, extColor: '', intColor: '', dealer: '' });

function apply(v:any){
  // auto-fix wrong order (if from > to, swap)
  if (v.from && v.to && dayjs(v.from).isAfter(dayjs(v.to))) {
    const tmp = v.from; v.from = v.to; v.to = tmp;
  }
  filters.value = v; page.value = 1;
}

// Options
const options = {
  extColors: uniq(raw.value.map(r=>r.exteriorColor)),
  intColors: uniq(raw.value.map(r=>r.interiorColor)),
  dealers:   uniq(raw.value.map(r=>r.dealer))
};

// Filtered data
const filtered = computed(()=> raw.value.filter(r=>{
  if(!withinRange(r, filters.value.from, filters.value.to)) return false;
  if(filters.value.extColor && r.exteriorColor !== filters.value.extColor) return false;
  if(filters.value.intColor && r.interiorColor !== filters.value.intColor) return false;
  if(filters.value.dealer && r.dealer !== filters.value.dealer) return false;
  return true;
}));

// ---- Dynamic month series ----
function monthLabelsBetween(fromISO:string, toISO:string){
  let cur = dayjs(fromISO).startOf('month');
  const end = dayjs(toISO).startOf('month');
  const labels:string[] = [];
  while(cur.isBefore(end) || cur.isSame(end)){
    labels.push(cur.format('MMM-YY'));
    cur = cur.add(1,'month');
  }
  return labels;
}

const monthSeries = computed(()=>{
  const isDefaultRange =
    filters.value.from === initialFrom &&
    filters.value.to === initialTo;

  let labels:string[];
  if (isDefaultRange) {
    // Initial view -> show last 3 months counting back from initialTo
    const toMoment = dayjs(initialTo);
    const start3 = toMoment.startOf('month').subtract(2,'month');
    labels = monthLabelsBetween(start3.format('YYYY-MM-DD'), toMoment.format('YYYY-MM-DD'));
  } else {
    // User-customized dates -> show ALL months between from..to (inclusive)
    labels = monthLabelsBetween(filters.value.from, filters.value.to);
  }

  const byMonth = groupBy(filtered.value, r=> dayjs(r.bookingAt).format('MMM-YY'));
  return labels.map(label => ({ label, value: byMonth[label]?.length ?? 0 }));
});

// Color stacked
const colorCats = computed(()=> uniq(filtered.value.map(r=>r.exteriorColor)));
const colorBlack = computed(()=> colorCats.value.map(c=> filtered.value.filter(r=> r.exteriorColor===c && r.interiorColor==='Black').length));
const colorTan   = computed(()=> colorCats.value.map(c=> filtered.value.filter(r=> r.exteriorColor===c && r.interiorColor==='Tan').length));

// Dealer bar
const byDealer = computed(()=>{
  const g = groupBy(filtered.value, r=> r.dealer);
  const labels = Object.keys(g).sort((a,b)=> g[b].length - g[a].length);
  const values = labels.map(l=> g[l].length);
  return { labels, values };
});

// Packages pie
const pkgPie = computed(()=>{
  const g = groupBy(filtered.value, r=> r.package);
  return Object.entries(g).map(([name, items])=>({ name: name==='None'?'No Package': 'Package '+name, value: (items as any[]).length }));
});

// Pagination + export
const page = ref(1);
const paged = computed(()=> paginate(filtered.value, page.value, 10));

function exportExcel(){
  const data = filtered.value.map(r=>({
    'Booking At': formatDateTime(r.bookingAt),
    'Booking No': r.bookingNo,
    'Mazda ID': r.mazdaId,
    'First Name': r.firstName,
    'Last Name': r.lastName,
    'Dealer': r.dealer,
    'Exterior Color': r.exteriorColor,
    'Interior Color': r.interiorColor,
    'Package': r.package,
    'Email': r.email || '',
    'Phone': r.phone || '',
    'Model': r.model || '',
    'Range': r.range || ''
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Prebookings');
  XLSX.writeFile(wb, 'prebookings.xlsx');
}

const showDetail = ref(false);
const selected = ref<Prebooking | null>(null);
function onView(r: Prebooking){
  selected.value = r;
  showDetail.value = true;
}
</script>
