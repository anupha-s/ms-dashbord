<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="section-title">
      <div style="color:#c53030;">
        หมายเลขการจอง {{ record.bookingNo }}
      </div>
    </div>

    <div class="date">{{ formatDateTime(record.bookingAt) }}</div>

    <hr class="divider" />

    <div class="section-title">ข้อมูลผู้ทำการจองสิทธิ์เสนอพิเศษ</div>
    <div class="kv">
      <div class="k">Mazda ID:</div><div class="v">{{ record.mazdaId || '-' }}</div>
      <div class="k">ชื่อ:</div><div class="v">{{ record.firstName || '-' }}</div>
      <div class="k">นามสกุล:</div><div class="v">{{ record.lastName || '-' }}</div>
      <div class="k">อีเมล:</div><div class="v"><a v-if="record.email" :href="'mailto:'+record.email">{{ record.email }}</a><span v-else>-</span></div>
      <div class="k">เบอร์โทร:</div><div class="v"><a v-if="record.phone" :href="'tel:'+record.phone">{{ record.phone }}</a><span v-else>-</span></div>
    </div>

    <hr class="divider" />

    <div class="section-title">แบบสอบถามความสนใจรถ {{ record.model || 'MAZDA6e' }}</div>
    <div class="kv two">
      <div class="k">รุ่นรถที่คุณสนใจ</div><div class="v">{{ record.range || 'Long Range 552 km (WLTP)' }}</div>
      <div class="k">สีรถที่คุณสนใจ</div><div class="v">{{ record.exteriorColor }}</div>
      <div class="k">วัสดุภายในที่คุณสนใจ</div><div class="v">{{ record.interiorColor }}</div>
    </div>

    <hr class="divider" />

    <div class="section-title">ข้อเสนอพิเศษที่ลูกค้าเลือก</div>
    <div class="offer">{{ record.offerText || defaultOffer }}</div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
import type { Prebooking } from '../types';
import { formatDateTime } from '../utils';

const props = defineProps<{ open:boolean, record: Prebooking }>();
defineEmits(['close']);

const defaultOffer = `ส่วนลดเงินสดพิเศษ 50,000 บาท และดอกเบี้ยพิเศษ 0.5%
พิเศษ! สำหรับผู้จองและร่วมทดลองขับในกิจกรรม Mazda Sneak Test drive
ฟรี! ประกันภัยชั้นหนึ่ง Mazda Premium Insurance 1 ปี มูลค่า 26,999 บาท
ของขวัญ Exclusive Premium Gift จาก Mazda ที่มอบให้ผู้จองสิทธิ์ Pre-booked ทุกคน`;
</script>

<style scoped>
.section-title{font-weight:700;margin:6px 0 10px 0}
.date{font-size:14px;color:#374151;margin-bottom:6px}
.divider{border:none;border-top:1px solid #e5e7eb;margin:12px 0}
.kv{display:grid;grid-template-columns: 160px 1fr;row-gap:8px;column-gap:12px;font-size:14px}
.kv.two{grid-template-columns: 220px 1fr}
.k{color:#111827}
.v a{color:#1f6feb;text-decoration:underline}
.offer{white-space:pre-line;line-height:1.5}
</style>
