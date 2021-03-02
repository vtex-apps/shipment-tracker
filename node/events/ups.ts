import { CARRIERS } from '../constants'

const UPS_REGEX = [
  '^(1Z)[0-9A-Z]{16}$',
  '^(T)+[0-9A-Z]{10}$',
  '^[0-9]{9}$',
  '^[0-9]{26}$',
]

export const ups = {
  detect: (shipment: Package) => {
    if (shipment.courier.toLowerCase().includes('ups')) {
      return CARRIERS.UPS
    }

    const trackingNumber = shipment.trackingNumber.replace(/\s/g, '')

    const regexp = new RegExp(UPS_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.UPS : null
  },
}
