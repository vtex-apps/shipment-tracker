import { Carrier } from '../constants'
import { carrierLookup } from './carrierRegex'

export const getCarrier = (shipment: Package): Carrier | null => {
  let matched: Carrier | null = null

  for (const carrier in carrierLookup) {
    const match = carrierLookup[carrier as keyof typeof carrierLookup](
      shipment.trackingNumber
    )

    if (match) {
      matched = match
      break
    }
  }

  return matched
}
