import { resolvers } from '../resolvers'
import { getCarrier } from '.'

export async function orderStatusChange(ctx: StatusChangeContext) {
  const {
    body,
    clients: { oms },
    vtex: { logger },
  } = ctx

  console.log('event', body)

  if (body.domain === 'Marketplace') {
    return
  }

  const order = await oms.getOrder(body.orderId)
  console.log('event order', order)

  if (!order) {
    return
  }

  const { packages } = order.packageAttachment || []

  console.log('packages', packages)

  const shipments = []
  for (const shipment of packages) {
    // eslint-disable-next-line no-await-in-loop
    const carrier = await getCarrier(ctx, shipment)
    const externalLink = shipment.trackingUrl // add trackingUrl validation

    if (carrier) {
      console.log('identified carrier', carrier)

      const data = {
        trackingNumber: shipment.trackingNumber,
        carrier,
        delivered: false,
        orderId: order.orderId,
        invoiceId: shipment.invoiceNumber,
        externalLink: externalLink ?? '',
      }

      console.log('addShipment data', data)

      shipments.push(resolvers.Mutation.addShipment(null, data, ctx))
    }
  }

  try {
    const result = await Promise.all(shipments)
    console.log('promise result', result)
  } catch (err) {
    logger.error({
      error: err,
      message: 'ShipmentTracker-OrderStatusChangeError',
    })
  }
}
