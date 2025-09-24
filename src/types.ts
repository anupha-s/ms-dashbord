export type Prebooking = {
  bookingAt: string;         // ISO date string
  bookingNo: string;
  mazdaId: string;
  firstName: string;
  lastName: string;
  dealer: string;
  exteriorColor: string;
  interiorColor: string;     // 'Black' | 'Tan' | 'Unknown'
  package: string;           // 'None' | 'A' | 'B' | 'Package 1' etc.
  model?: string;
  range?: string;
  email?: string;
  phone?: string;
  colorCode?: string;
  status?: string;
  slip?: string;
};

// New API record shape
export type ApiRecord = {
  ID: string;
  Title?: string;
  MemberDisplayID?: string;
  MemberID?: string;
  AssociateID?: string;
  PackageID?: string;
  PackageName?: string;
  ModelID?: string;
  Model?: string;
  Grade?: string;
  ColorCode?: string;
  Color?: string;
  Dealer?: string;
  DealerID?: string;
  DealerCode?: string;
  DealerType?: string;
  Status?: string;
  StatusUpdateBy?: string;
  Slip?: string;
  BookingCreated: string;     // 'YYYY-MM-DD HH:mm:ss'
  BookingChanged?: string;
  associatedPerson?: {
    associatedPersonId?: string;
    relationshipType?: string;
    firstName?: string;
    lastName?: string;
  };
  // Optional future field; we also check (r as any).Interior in normalizer
  Interior?: string;
};
