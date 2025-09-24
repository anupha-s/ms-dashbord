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
      :sort="sort"
      @sort-change="sort = $event; page = 1"
      @change-page="page = $event"
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

// Components
import Filters from './components/Filters.vue';
import KPI from './components/KPI.vue';
import StackedColor from './components/StackedColor.vue';
import DealerBar from './components/DealerBar.vue';
import PackagePie from './components/PackagePie.vue';
import DataTable from './components/DataTable.vue';
import DetailModal from './components/DetailModal.vue';

// Utils & Types
import { uniq, groupBy, withinRange, paginate, formatDateTime } from './utils';
import { normalizeApiRecords } from './data/normalize';
import type { ApiRecord, Prebooking } from './types';

// -------- Load data (supports both new API array & old { prebookings: [...] }) --------
import apiRows from './data/mock.api.json';     // << ใช้ไฟล์โครงสร้างใหม่เป็นค่าเริ่ม
import { mockData as fallback } from './data/mock';

function toBase(data: any): Prebooking[] {
  if (Array.isArray(data)) return normalizeApiRecords(data as ApiRecord[]);
  if (data?.prebookings?.length) return data.prebookings as Prebooking[];
  return fallback as Prebooking[];
}
const base: Prebooking[] = toBase(apiRows);
const raw = ref<Prebooking[]>(base);

// -------- ค่าดีฟอลต์ช่วงวันที่ (from=วันแรกที่มีข้อมูล, to=max(วันนี้, วันที่ล่าสุดในข้อมูล)) --------
const dataMin = raw.value.length ? dayjs(Math.min(...raw.value.map(r => dayjs(r.bookingAt).valueOf()))) : dayjs();
const dataMax = raw.value.length ? dayjs(Math.max(...raw.value.map(r => dayjs(r.bookingAt).valueOf()))) : dayjs();
const realToday = dayjs();
const initialFrom = dataMin.startOf('day').format('YYYY-MM-DD');
const initialTo   = (dataMax.isAfter(realToday) ? dataMax : realToday).startOf('day').format('YYYY-MM-DD');

const filters = ref({ from: initialFrom, to: initialTo, extColor: '', intColor: '', dealer: '' });
const userApplied = ref(false);
function apply(v:any){
  if (v.from && v.to && dayjs(v.from).isAfter(dayjs(v.to))) {
    const tmp = v.from; v.from = v.to; v.to = tmp;
  }
  filters.value = v;
  page.value = 1;
  userApplied.value = true;
}

// -------- Dropdown options --------
const options = {
  extColors: uniq(raw.value.map(r=>r.exteriorColor)),
  intColors: uniq(raw.value.map(r=>r.interiorColor)),
  dealers:   uniq(raw.value.map(r=>r.dealer))
};

// -------- Filter rows by current filters --------
const filtered = computed(()=> raw.value.filter(r=>{
  if(!withinRange(r, filters.value.from, filters.value.to)) return false;
  if(filters.value.extColor && r.exteriorColor !== filters.value.extColor) return false;
  if(filters.value.intColor && r.interiorColor !== filters.value.intColor) return false;
  if(filters.value.dealer && r.dealer !== filters.value.dealer) return false;
  return true;
}));

// -------- Dynamic month series for KPI (3 months initially, else full range) --------
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
  let labels:string[];
  if (userApplied.value) {
    labels = monthLabelsBetween(filters.value.from, filters.value.to);
  } else {
    const toMoment = dayjs(initialTo);
    const start3 = toMoment.startOf('month').subtract(2,'month');
    labels = monthLabelsBetween(start3.format('YYYY-MM-DD'), toMoment.format('YYYY-MM-DD'));
  }
  const byMonth = groupBy(filtered.value, r=> dayjs(r.bookingAt).format('MMM-YY'));
  return labels.map(label => ({ label, value: byMonth[label]?.length ?? 0 }));
});

// -------- Aggregations for other charts --------
const colorCats = computed(()=> uniq(filtered.value.map(r=>r.exteriorColor)));
const colorBlack = computed(()=> colorCats.value.map(c=> filtered.value.filter(r=> r.exteriorColor===c && r.interiorColor==='Black').length));
const colorTan   = computed(()=> colorCats.value.map(c=> filtered.value.filter(r=> r.exteriorColor===c && r.interiorColor==='Tan').length));

const byDealer = computed(()=>{
  const g = groupBy(filtered.value, r=> r.dealer);
  const labels = Object.keys(g).sort((a,b)=> g[b].length - g[a].length);
  const values = labels.map(l=> g[l].length);
  return { labels, values };
});

const pkgPie = computed(()=>{
  const g = groupBy(filtered.value, r=> r.package);
  return Object.entries(g).map(([name, items])=>({ name: name==='None'?'No Package': 'Package '+name, value: (items as any[]).length }));
});

// -------- Sorting (default: bookingAt desc = ล่าสุดก่อน) --------
type SortKey = 'bookingAt'|'bookingNo'|'mazdaId'|'firstName'|'lastName'|'dealer';
type SortDir = 'asc'|'desc';
const sort = ref<{ key: SortKey, dir: SortDir }>({ key: 'bookingAt', dir: 'desc' });

const sorted = computed(()=>{
  const arr = [...filtered.value];
  const dir = sort.value.dir === 'asc' ? 1 : -1;
  const cmp = (a:any,b:any)=> (a>b?1:a<b?-1:0) * dir;
  arr.sort((a:any,b:any)=>{
    switch(sort.value.key){
      case 'bookingAt': return ((new Date(a.bookingAt)).getTime() - (new Date(b.bookingAt)).getTime()) * dir;
      case 'bookingNo': return cmp(a.bookingNo, b.bookingNo);
      case 'mazdaId':   return cmp(a.mazdaId, b.mazdaId);
      case 'firstName': return cmp(a.firstName, b.firstName);
      case 'lastName':  return cmp(a.lastName, b.lastName);
      case 'dealer':    return cmp(a.dealer, b.dealer);
      default: return 0;
    }
  });
  return arr;
});

// -------- Pagination + Export --------
const page = ref(1);
const paged = computed(()=> paginate(sorted.value, page.value, 10));

function exportExcel(){
  const data = sorted.value.map(r=>({
    'Booking At': formatDateTime(r.bookingAt),
    'Booking No': r.bookingNo,
    'Mazda ID': r.mazdaId,
    'First Name': r.firstName,
    'Last Name': r.lastName,
    'Dealer': r.dealer,
    'Exterior Color': r.exteriorColor,
    'Interior Color': r.interiorColor,
    'Package': r.package,
    'Model': r.model || '',
    'Range': r.range || '',
    'Email': r.email || '',
    'Phone': r.phone || '',
    'Status': r.status || '',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Prebookings');
  XLSX.writeFile(wb, 'prebookings.xlsx');
}

// -------- Detail modal --------
const showDetail = ref(false);
const selected = ref<Prebooking | null>(null);
function onView(r: Prebooking){
  selected.value = r;
  showDetail.value = true;
}
</script>
