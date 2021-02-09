/* eslint-disable @typescript-eslint/no-explicit-any */
interface OMSOrder {
  orderId: string
  status: 'invoiced' | 'cancel' | 'canceled'
  packageAttachment: PackageAttachment
}

interface PackageAttachment {
  packages: Package[]
}

interface Package {
  items: Item[]
  courier: string
  invoiceNumber: string
  invoiceValue: number
  invoiceUrl: string | null
  issuanceDate: string
  trackingNumber: string
  invoiceKey: string | null
  trackingUrl: string | null
  embeddedInvoice: string
  type: string
  courierStatus: string | null
  cfop: string | null
  restitutions: any
  volumes: any | null
}

interface Item {
  itemIndex: number
  quantity: number
  price: number
  description: string | null
  unitMultiplier: number
}
