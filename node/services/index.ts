import { uspsTracking } from './usps'

export const trackingService = {
  update: (ctx: Context) => {
    // User settings
    const hasUsps = true

    if (hasUsps) {
      uspsTracking(ctx)
    }
  },
}
