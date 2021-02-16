import { resolvers } from '../resolvers'
import { getCarrier } from '../utils/getCarrier'

export async function orderStatusChange(ctx: StatusChangeContext) {
  const {
    body,
    clients: { oms },
    // vtex: { logger },
  } = ctx

  if (body.domain === 'Marketplace') {
    return
  }

  const order = await oms.getOrder(body.orderId)

  if (!order) {
    return
  }

  const { packages } = order.packageAttachment || []

  const addShipments = packages.reduce(
    (shipments: Array<Promise<string>>, shipment) => {
      const carrier = getCarrier(shipment)
      const externalLink = shipment.trackingUrl // add trackingUrl validation

      if (!carrier) {
        return shipments
      }

      const data = {
        trackingNumber: shipment.trackingNumber,
        carrier,
        delivered: false,
        orderId: order.orderId,
        invoiceId: shipment.invoiceNumber,
        externalLink: externalLink ?? '',
      }

      shipments.push(resolvers.Mutation.addShipment(null, data, ctx))

      return shipments
    },
    []
  )

  try {
    const success = await Promise.all(addShipments)
    console.log(success)
  } catch (err) {
    console.log(err)
  }
}
