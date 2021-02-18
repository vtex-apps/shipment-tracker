import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

const BASE_URL = ''

export default class FedExClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(BASE_URL, context, {
      ...options,
      headers: {
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
      },
    })
  }

  public async getTracking(
    url: string,
    body: string
    // vtexAppKey: string,
    // vtexAppToken: string
  ): Promise<string> {
    return this.http.post(url, body, {
      headers: {
        // 'X-VTEX-API-AppKey': vtexAppKey,
        // 'X-VTEX-API-AppToken': vtexAppToken,
      },
    })
  }
}
