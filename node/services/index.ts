import { uspsTracking } from './usps'
import { fedexTracking } from './fedex'
import { upsTracking } from './ups'
import { canadaPostTracking } from './canadaPost'

export const trackingService = {
  update: async (ctx: Context) => {
    const appId = process.env.VTEX_APP_ID
    const settings = appId
      ? ((await ctx.clients.apps.getAppSettings(appId)) as AppSettings)
      : null

    if (!settings?.carriers) {
      console.log('no settings config')
      return
    }

    console.log('config', settings)

    const {
      carriers: {
        usps,
        ups,
        fedex,
        canadaPost
      },
    } = settings

    if (usps.userId) {
      uspsTracking(usps, ctx)
    }

    if (fedex.key) {
      fedexTracking(fedex, ctx)
    }

    if (ups.key) {
      upsTracking(ups, ctx)
    }

    if (canadaPost.userId) {
      canadaPostTracking(canadaPost, ctx)
    }
  },
}
