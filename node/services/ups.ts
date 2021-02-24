import { resolvers } from '../resolvers'


export const upsTracking = async (settings: UpsConfig, ctx: Context) => {
  const {
    clients: { ups },
  } = ctx

  const { key } = settings
  const testTrackingNum = '572254454'

  const args = { carrier: 'UPS' }
  const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

  for (const shipment of shipments) {
    const trackingNum = shipment.trackingNumber
    console.log(trackingNum)

    const response:any = await ups.getTracking(testTrackingNum, key)

    if (response.trackResponse.shipment[0].warnings) {
      continue
    }

    const packageInfo = response.trackResponse.shipment[0].package[0]
    const events = packageInfo.activity

    if (!events) {
      continue
    }

    let newUpdateTime = new Date(shipment.lastInteractionDate)
    let delivered = false

    for (const event of events) {
      const year = event.date.slice(0, 4)
      const month = event.date.slice(4, 6)
      const day = event.date.slice(6)
      const hour = event.time.slice(0, 2)
      const minute = event.time.slice(2, 4)
      const second = event.time.slice(4)

      const timestamp = new Date(year, month, day, hour, minute, second)


      if (!shipment.lastInteractionDate || timestamp > new Date(shipment.lastInteractionDate)) {
        const interactionDelivered = event.status.type === 'D'
        const interactionMessage = event.status.description

        if (interactionDelivered) {
          delivered = true
        }

        const interaction = {
          shipmentId: shipment.id,
          interaction: interactionMessage,
          delivered: interactionDelivered
        }

        if (newUpdateTime < timestamp) {
          newUpdateTime = timestamp
        }

        resolvers.Mutation.addInteraction(null, interaction, ctx)
      }

      const updateShipment = {
        id: shipment.id,
        delivered,
        lastInteractionDate: newUpdateTime.toUTCString()
      }
      resolvers.Mutation.updateShipment(null, updateShipment, ctx)
    }

  }

}
