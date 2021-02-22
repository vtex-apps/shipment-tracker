import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class UPSClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://wwwcie.ups.com', context, {
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
  ): Promise<string> {
    return this.http.get(`/track/v1/details/${trackingNumber}`, {
      headers: {
        AccessLicenseNumber: key,
      },
    })
  }
}
