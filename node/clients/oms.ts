import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

const FOUR_SECONDS = 4 * 1000

export default class OMSClient extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: ctx.authToken,
      },
      timeout: FOUR_SECONDS,
    })
  }

  public async getOrder(orderId: string): Promise<OMSOrder> {
    return this.http.get(`/api/oms/pvt/orders/${orderId}`, {
      metric: 'order-get',
    })
  }

  public async updateOrderTracking(
    orderId: string,
    invoiceId: string,
    update: TrackingUpdate
  ): Promise<OMSOrderTracking> {
    return this.http.put(
      `/api/oms/pvt/orders/${orderId}/invoice/${invoiceId}/tracking`,
      update,
      {
        metric: 'order-tracking-put',
      }
    )
  }
}
