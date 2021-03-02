import { CARRIERS } from '../constants'

const USPS_REGEX = [
  '^((9[12345])?(([0-9]){24}|([0-9]){20}))$',
  `^([0-9]{20})$`,
  `^(420)(([0-9]){9})((9[2345])?(([0-9]){20}))$`,
  '^([A-Z]{2})[0-9]{9}(US)$',
]

export const usps = {
  detect: (shipment: Package) => {
    if (shipment.courier.toLowerCase().includes('usps')) {
      return CARRIERS.USPS
    }

    const trackingNumber = shipment.trackingNumber.replace(/\s/g, '')

    const regexp = new RegExp(USPS_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.USPS : null
  },
}
