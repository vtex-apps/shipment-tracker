import { trackingService } from '../services'

export async function updateTracking(ctx: Context) {
  const { response } = ctx
  // verify request

  // get tracking
  trackingService.update(ctx)

  response.set('Cache-Control', 'no-cache')
  response.status = 200
  return response
}
