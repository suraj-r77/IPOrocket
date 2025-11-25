
export enum ApplicationStatus {
  Pending = 'PENDING',
  Applied = 'APPLIED',
  Allotted = 'ALLOTTED',
}

export enum Broker {
  Upstox = 'UPSTOX',
  Zerodha = 'ZERODHA',
  Groww = 'GROWW',
  AngleOne = 'ANGLE ONE',
  Unknown = 'UNKNOWN',
}

export interface Account {
  id: string;
  name: string;
  broker: Broker;
  phone: string;
  email?: string;
  pan?: string;
  loginId?: string;
  pin?: string;
  tpin?: string;
  year?: string;
  notes?: string;
  status: ApplicationStatus;
  // Post-allotment tracking
  sharesSold?: boolean; // Checkbox
  soldValue?: string;   // The amount sold for (Withdrawal Amount)
  amountWithdrawn?: boolean; // Checkbox for "Money in Bank"
  profit?: string; // Legacy field, keeping optional, but UI will now calculate dynamic profit
}
