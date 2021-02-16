import { CARRIERS } from '../typings/constants'

const USPS_REGEX = [
  '^(94|93|92|94|95)[0-9]{20}$',
  '^(94|93|92|94|95)[0-9]{22}$',
  '^(70|14|23|03)[0-9]{14}$',
  '^(M0|82)[0-9]{8}$',
  '^([A-Z]{2})[0-9]{9}([A-Z]{2})$',
]

const UPS_REGEX = [
  '^(1Z)[0-9A-Z]{16}$',
  '^(T)+[0-9A-Z]{10}$',
  '^[0-9]{9}$',
  '^[0-9]{26}$',
]

//   const FEDEX_REGEX = ['^[0-9]{20}$', '^[0-9]{15}$', '^[0-9]{12}$', '^[0-9]{22}$']

const isUSPS = (number: string) => {
  const uspsTest = new RegExp(USPS_REGEX.join('|'), 'i')
  return uspsTest.test(number)
}

const isUPS = (number: string) => {
  const upsTest = new RegExp(UPS_REGEX.join('|'), 'i')
  return upsTest.test(number)
}

export const getCarrier = (shipment: Package): Carrier | null => {
  const { courier, trackingNumber } = shipment

  if (courier.includes('USPS')) {
    return CARRIERS.USPS
  }

  if (courier.includes('UPS')) {
    return CARRIERS.UPS
  }

  if (isUSPS(trackingNumber)) {
    return CARRIERS.USPS
  }

  if (isUPS(trackingNumber)) {
    return CARRIERS.UPS
  }

  return null
}
