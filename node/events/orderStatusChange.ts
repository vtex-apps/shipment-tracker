/* eslint-disable no-await-in-loop */
import { resolvers } from '../resolvers'
import { getCarrier } from '.'

export async function orderStatusChange(ctx: StatusChangeContext) {
  const {
    body,
    clients: { oms },
    vtex: { logger },
  } = ctx

  if (body.domain === 'Marketplace') {
    return
  }

  const order = await oms.getOrder(body.orderId)

  if (!order) {
    return
  }

  const { packages } = order.packageAttachment || []

  const shipments = []
  for (const shipment of packages) {
    const { trackingNumber } = shipment
    const existingShipment = await resolvers.Query.shipment(
      null,
      trackingNumber,
      ctx
    )

    if (!existingShipment) {
      const carrier = await getCarrier(ctx, shipment)
      const externalLink = shipment.trackingUrl // add trackingUrl validation

      if (carrier) {
        const data = {
          trackingNumber: shipment.trackingNumber,
          carrier,
          delivered: false,
          orderId: order.orderId,
          invoiceId: shipment.invoiceNumber,
          externalLink: externalLink ?? '',
        }

        shipments.push(resolvers.Mutation.addShipment(null, data, ctx))
      }
    }
  }

  try {
    await Promise.all(shipments)
  } catch (err) {
    logger.error({
      error: err,
      message: 'ShipmentTracker-OrderStatusChangeError',
    })
  }
}
