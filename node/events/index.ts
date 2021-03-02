import { Carrier } from '../constants'
import { canadaPost } from './canadaPost'
import { fedex } from './fedex'
import { ups } from './ups'
import { usps } from './usps'

export const carrierLookup = {
  usps,
  ups,
  fedex,
  canadaPost,
}

export const getCarrier = async (
  ctx: StatusChangeContext,
  shipment: Package
): Promise<Carrier | null> => {
  let matched: Carrier | null = null

  const appId = process.env.VTEX_APP_ID
  const settings = appId
    ? ((await ctx.clients.apps.getAppSettings(appId)) as AppSettings)
    : null

  if (!settings?.carriers) {
    console.log('no settings config')
    return null
  }

  for (const carrier in carrierLookup) {
    const carrierConfig = settings.carriers[carrier as keyof Carriers]

    if (carrierConfig.active) {
      const lookup = carrierLookup[carrier as keyof typeof carrierLookup].detect
      const match = lookup(shipment)

      if (match) {
        matched = match
        break
      }
    }
  }

  return matched
}
