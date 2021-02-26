export const CARRIERS = {
  UPS: 'UPS',
  USPS: 'USPS',
  FEDEX: 'FEDEX',
  CANADAPOST: 'CANADAPOST',
} as const

export type Carrier = typeof CARRIERS[keyof typeof CARRIERS]
