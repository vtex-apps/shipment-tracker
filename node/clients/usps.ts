import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

const TEN_SECONDS = 10 * 1000

export default class USPSClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://secure.shippingapis.com', context, {
      ...options,
      headers: {
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
      },
      timeout: TEN_SECONDS,
    })
  }

  public async getTracking(xml: string): Promise<string> {
    return this.http.get(`/ShippingAPI.dll?API=TrackV2&XML=${xml}`, {
      metric: 'usps-get-tracking',
    })
  }
}
