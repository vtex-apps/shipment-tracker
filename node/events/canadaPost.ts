import { CARRIERS } from '../constants'

const CANADA_POST_REGEX = ['^[0-9]{16}$', '^[A-Z]{2}[0-9]{9}[A-Z]{2}$']

export const canadaPost = {
  detect: (shipment: Package) => {
    if (shipment.courier.toLowerCase().includes('canada')) {
      return CARRIERS.CANADAPOST
    }

    const trackingNumber = shipment.trackingNumber.replace(/\s/g, '')

    const regexp = new RegExp(CANADA_POST_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.CANADAPOST : null
  },
}
