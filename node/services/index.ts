import { uspsTracking } from './usps'
import { fedexTracking } from './fedex'
import { upsTracking } from './ups'

export const trackingService = {
  update: async (ctx: Context) => {
    const appId = process.env.VTEX_APP_ID
    const settings = appId && (await ctx.clients.apps.getAppSettings(appId))
    const { carriers } = settings

    const hasUsps = carriers.usps.active
    const hasFedex = carriers.fedex.active
    const hasUps = carriers.ups.active

    if (hasUsps) {
      uspsTracking(ctx)
    }

    if (hasFedex) {
      fedexTracking(ctx)
    }

    if (hasUps) {
      upsTracking(ctx)
    }
  },
}
