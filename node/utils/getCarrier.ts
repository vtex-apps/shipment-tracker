import { CARRIERS } from '../constants'

export const getCarrier = (shipment: Package): Carrier | null => {
  const { courier } = shipment

  if (!courier) {
    return null
  }

  if (courier.includes('USPS')) {
    return CARRIERS.USPS
  }

  if (courier.includes('UPS')) {
    return CARRIERS.UPS
  }

  if (courier.includes('FEDEX')) {
    return CARRIERS.UPS
  }

  if (courier.includes('CANADAPOST')) {
    return CARRIERS.CANADAPOST
  }

  return null
}
