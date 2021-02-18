import { uspsTracking } from './usps'
import { fedexTracking } from './fedex'
import { upsTracking } from './ups'

export const trackingService = {
  update: (ctx: Context) => {
    // User settings
    const hasUsps = false
    const hasFedex = false
    const hasUps = true

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
