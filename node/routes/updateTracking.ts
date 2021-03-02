import { trackingService } from '../services'

export async function updateTracking(ctx: Context) {
  const { response } = ctx
  // verify request

  const appId = process.env.VTEX_APP_ID
  const settings = appId
    ? ((await ctx.clients.apps.getAppSettings(appId)) as AppSettings)
    : null

  if (!settings?.carriers) {
    console.log('no settings config')
    return null
  }

  for (const carrier in trackingService) {
    const carrierConfig = settings.carriers[carrier]

    console.log('config', carrierConfig)
    if (carrierConfig.active) {
      trackingService[carrier as keyof typeof trackingService](
        carrierConfig,
        ctx
      )
    }
  }

  response.set('Cache-Control', 'no-cache')
  response.status = 200
  return response
}
