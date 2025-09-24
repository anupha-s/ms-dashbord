export type Prebooking = {
  bookingAt: string;
  bookingNo: string;
  mazdaId: string;
  firstName: string;
  lastName: string;
  dealer: string;
  exteriorColor: string;
  interiorColor: string;
  package: 'A' | 'B' | 'None';
  email?: string;
  phone?: string;
  model?: string;
  range?: string;
  offerText?: string;
};
