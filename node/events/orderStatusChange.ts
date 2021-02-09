import { getCarrier } from '../utils/getCarrier'

export async function orderStatusChange(ctx: StatusChangeContext) {
  const {
    body,
    clients: { oms },
    // clients: { oms, apps },
  } = ctx

  // const app: string = getAppId()
  // const settings = await apps.getAppSettings(app)

  console.log('event', body)

  if (body.domain === 'Marketplace') {
    return
  }

  const order = await oms.getOrder(body.orderId)

  if (!order) {
    return
  }

  const { packages } = order.packageAttachment || []

  for (const shipment of packages) {
    // identify
    const carrier = getCarrier(shipment)

    if (!carrier) {
      console.log('unidentified carrier')
    }

    console.log(carrier)
    // save tracking
    // {
    //   trackingNum: shipment.trackingNumber,
    //   carrier,
    //   status
    // }
  }
}
