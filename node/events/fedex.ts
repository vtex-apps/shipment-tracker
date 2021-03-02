import { CARRIERS } from '../constants'

const FEDEX_REGEX = [
  '^96[0-9]{32}$',
  '^100[0-9]{31}$',
  '^96[0-9]{20}$',
  '^(92)?[0-9]{20}$',
  '^[0-9]{18}$',
  '^[0-9]{15}$',
  '^[0-9]{12}$',
]

export const fedex = {
  detect: (shipment: Package) => {
    if (shipment.courier.toLowerCase().includes('fedex')) {
      return CARRIERS.FEDEX
    }

    const trackingNumber = shipment.trackingNumber.replace(/\s/g, '')

    const regexp = new RegExp(FEDEX_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.FEDEX : null
  },
}
