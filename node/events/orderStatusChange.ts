import { resolvers } from '../resolvers'
import { getCarrier } from '../utils/getCarrier'

export async function orderStatusChange(ctx: StatusChangeContext) {
  const {
    body,
    clients: { oms },
    // vtex: { logger },
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

      console.log('addShipment data', data)

      shipments.push(resolvers.Mutation.addShipment(null, data, ctx))

      return shipments
    },
    []
  )

  try {
    const result = await Promise.all(addShipments)
    console.log('promise result', result)
  } catch (err) {
    console.log(err)
  }
}
