import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class CanadaPostClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    // production - soa-gw.canadapost.ca
    super('http://soa-gw.canadapost.ca', context, {
      ...options,
      headers: {
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
      },
    })
  }

  public async getTracking(
    trackingNumber: string,
    key: string
    // vtexAppKey: string,
    // vtexAppToken: string
  ): Promise<string> {
    return this.http.get(`/vis/track/pin/${trackingNumber}/detail`, {
      headers: {
        // 'X-VTEX-API-AppKey': vtexAppKey,
        // 'X-VTEX-API-AppToken': vtexAppToken,
        'Authorization': `Basic ${key}`,
        'Accept-language': 'en-CA',
        'Accept': 'application/vnd.cpc.track-v2+xml'
      },
    })
  }
}
