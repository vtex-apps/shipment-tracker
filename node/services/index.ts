// import { uspsTracking } from './usps'
// import { fedexTracking } from './fedex'
// import { upsTracking } from './ups'
import { canadaPostTracking} from './canadaPost'

export const trackingService = {
  update: async (ctx: Context) => {
    const appId = process.env.VTEX_APP_ID
    const settings =
      appId && ((await ctx.clients.apps.getAppSettings(appId)) as AppSettings)

    if (!settings) {
      console.log('no settings config')
      return
    }

    console.log(settings)

    const {
      carriers: {
        // usps,
        // ups,
        // fedex,
        canadaPost
      },
    } = settings

    // if (usps.active) {
    //   uspsTracking(usps, ctx)
    // }

    // if (fedex.active) {
    //   fedexTracking(fedex, ctx)
    // }

    // if (ups.active) {
    //   upsTracking(ups, ctx)
    // }

    // if (canadaPost.active) {
      canadaPostTracking(canadaPost, ctx)
    // }
  },
}
