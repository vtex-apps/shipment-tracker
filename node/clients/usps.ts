import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class USPSClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://secure.shippingapis.com', context, {
      ...options,
      headers: {
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
      },
    })
  }

  public async getTracking(
    xml: string
    // vtexAppKey: string,
    // vtexAppToken: string
  ): Promise<any> {
    return this.http.get(`/ShippingAPI.dll?API=TrackV2&XML=${xml}`, {
      headers: {
        // 'X-VTEX-API-AppKey': vtexAppKey,
        // 'X-VTEX-API-AppToken': vtexAppToken,
      },
      metric: 'usps-get-tracking',
    })
  }
}
