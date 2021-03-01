import { resolvers } from '../resolvers'


export const upsTracking = async (settings: UpsConfig, ctx: Context) => {
  const {
    clients: { ups, oms },
  } = ctx

  console.log(settings)
  const { key } = settings
  // const key = 'FD94AEEED2173F72'
  // const testTrackingNum = '7798339175'

  const args = { carrier: 'UPS' }
  const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

  for (const shipment of shipments) {
    const trackingNum = shipment.trackingNumber
    console.log(trackingNum)

    const response:any = await ups.getTracking(trackingNum, key)

    if (response.trackResponse.shipment[0].warnings) {
      continue
    }

    const packageInfo = response.trackResponse.shipment[0].package[0]
    const events = packageInfo.activity

    if (!events) {
      continue
    }

    let newUpdateTime = new Date(shipment.lastInteractionDate)
    let updateFlag = false
    let delivered = false
    let trackingEvents = []

    for (const event of events) {
      const year = event.date.slice(0, 4)
      const month = event.date.slice(4, 6)
      const day = event.date.slice(6)
      const hour = event.time.slice(0, 2)
      const minute = event.time.slice(2, 4)
      const second = event.time.slice(4)

      const timestamp = new Date(year, month, day, hour, minute, second)
      const interactionDelivered = event.status.type === 'D'
      const interactionMessage = event.status.description
      const city = event['location']['address']['city']
      const state = event['location']['address']['stateProvince']

      trackingEvents.push({ city, state, description: interactionMessage, date: timestamp.toUTCString() })


      if (!shipment.lastInteractionDate || timestamp > new Date(shipment.lastInteractionDate)) {

        updateFlag = true

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

    }

    const trackingUpdate = {
      isDelivered: delivered,
      events: trackingEvents.reverse(),
    }

    try{
      oms.updateOrderTracking(
        shipment.orderId,
        shipment.invoiceId,
        trackingUpdate
      )
    } catch {
      console.log("Update Order Tracking Error")
    }

    if (updateFlag) {
      const updateShipment = {
        id: shipment.id,
        delivered,
        lastInteractionDate: newUpdateTime.toUTCString()
      }
      resolvers.Mutation.updateShipment(null, updateShipment, ctx)
    }

  }

}
