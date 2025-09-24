<template>
  <div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="label">รายการจอง</div>
      <div class="row">
        <button @click="$emit('export-excel')">Export table</button>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>วันเวลาจอง</th>
          <th>หมายเลขการจอง</th>
          <th>Mazda ID</th>
          <th>ชื่อ</th>
          <th>นามสกุล</th>
          <th>ผู้จำหน่าย</th>
          <th>รายละเอียด</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in items" :key="r.bookingNo">
          <td>{{ formatDateTime(r.bookingAt) }}</td>
          <td>{{ r.bookingNo }}</td>
          <td>{{ r.mazdaId }}</td>
          <td>{{ r.firstName }}</td>
          <td>{{ r.lastName }}</td>
          <td>{{ r.dealer }}</td>
          <td><a href="#" @click.prevent="$emit('view', r)">รายละเอียด</a></td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button class="ghost" @click="$emit('change-page', page-1)" :disabled="page<=1">&lt; Prev</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="ghost" @click="$emit('change-page', page+1)" :disabled="page>=totalPages">Next &gt;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prebooking } from '../types';
import { formatDateTime } from '../utils';
defineProps<{ items: Prebooking[], page:number, totalPages:number }>();
defineEmits(['change-page','export-excel','view']);
</script>
