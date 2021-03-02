import { parseString } from 'xml2js'
import { resolvers } from '../resolvers'


export const canadaPost = async (settings: CanadaPostConfig, ctx: Context) => {
  const {
    clients: { canadaPost: canadaPostClient, oms },
    vtex: { logger }
  } = ctx

  console.log(settings)

  const { userId, password } = settings
  const combined = userId + ':' + password
  const encode = (str: string):string => Buffer.from(str, 'binary').toString('base64');

  const authKey = encode(combined)

  const args = { carrier: 'CANADAPOST' }
  const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

  console.log(shipments)
  for (const shipment of shipments) {
    const trackingNum = shipment.trackingNumber
    console.log("trackingNum =>", trackingNum)

    try {
      const response = await canadaPostClient.getTracking(trackingNum, authKey)
      parseString(response, (_err, result) => {
        console.log("result =>", result)
        const events = result['tracking-detail']['significant-events'][0]['occurrence']

        let newUpdateTime = new Date(shipment.lastInteractionDate)
        let updateFlag = false
        let delivered = false
        let trackingEvents = []

        for (const event of events) {
          console.log("event =>", event)
          const timeString = event['event-date'] + 'T' + event['event-time']
          const timestamp = new Date(timeString)

          const interactionDelivered = !!result['actual-delivery-date']
          const interactionMessage = event['event-description'][0]
          const [city] = event['event-site']
          const [state] = event['event-province']

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

        oms.updateOrderTracking(
          shipment.orderId,
          shipment.invoiceId,
          trackingUpdate
        )

        if (updateFlag) {
          const updateShipment = {
            id: shipment.id,
            delivered,
            lastInteractionDate: newUpdateTime.toUTCString()
          }

          resolvers.Mutation.updateShipment(null, updateShipment, ctx)
        }
      })

    } catch (err){
      logger.error({
        error: err,
        message: 'ShipmentTracker-CanadaPostTrackingError',
      })
      continue
    }
  }
}
