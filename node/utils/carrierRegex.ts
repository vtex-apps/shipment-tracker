import { CARRIERS } from '../constants'

export const carrierLookup = {
  usps: (trackingNumber: string) => {
    const USPS_REGEX = [
      '^((9[12345])?(([0-9]){24}|([0-9]){20}))$',
      `^([0-9]{20})$`,
      `^(420)(([0-9]){9})((9[2345])?(([0-9]){20}))$`,
      '^([A-Z]{2})[0-9]{9}(US)$',
    ]

    const regexp = new RegExp(USPS_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.USPS : null
  },
  ups: (trackingNumber: string) => {
    const UPS_REGEX = [
      '^(1Z)[0-9A-Z]{16}$',
      '^(T)+[0-9A-Z]{10}$',
      '^[0-9]{9}$',
      '^[0-9]{26}$',
    ]

    const regexp = new RegExp(UPS_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.UPS : null
  },
  fedex: (trackingNumber: string) => {
    const FEDEX_REGEX = [
      '^96[0-9]{32}$',
      '^100[0-9]{31}$',
      '^96[0-9]{20}$',
      '^(92)?[0-9]{20}$',
      '^[0-9]{18}$',
      '^[0-9]{15}$',
      '^[0-9]{12}$',
    ]

    const regexp = new RegExp(FEDEX_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.FEDEX : null
  },
  canadaPost: (trackingNumber: string) => {
    const CANADA_POST_REGEX = ['^[0-9]{16}$', '^[A-Z]{2}[0-9]{9}[A-Z]{2}$']

    const regexp = new RegExp(CANADA_POST_REGEX.join('|'), 'i')
    return regexp.test(trackingNumber) ? CARRIERS.CANADAPOST : null
  },
}
