interface Shipment {
  id: string
  trackingNumber: string
  carrier: string
  delivered: boolean
  orderId: string
  invoiceId: string
  externalLink: string
  lastInteractionDate: string
  createdIn: string
  updatedIn: string
}

interface AddShipmentArgs {
  trackingNumber: string
  carrier: Carrier
  orderId: string
  invoiceId: string
  externalLink: string
}

interface UpdateShipmentArgs {
  id: string
  trackingNumber?: string
  carrier?: Carrier
  orderId?: string
  invoiceId?: string
  externalLink?: string
  lastInteractionDate?: string
}

interface ShipmentsByCarrierArgs {
  carrier: Carrier
  page?: number
  pageSize?: number
  createdBefore?: string | null
}

interface Interaction {
  id: string
  shipmentId: string
  delivered: boolean
  createdIn: string
  updatedIn: string
}

interface AddInteractionArgs {
  shipmentId: string
  delivered: boolean
}
