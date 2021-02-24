import { parseString } from 'xml2js'
import { resolvers } from '../resolvers'


export const canadaPostTracking = async (settings: CanadaPostConfig, ctx: Context) => {
  const {
    clients: { canadaPost },
  } = ctx

  // Update to reflect user settings
  // URL needs to be updated for production

  console.log(settings)

  const userId = 'a48e2f2e66cc240f'
  const password = '862bbd5858a482687cf4a2'
  const combined = userId + ':' + password
  const encode = (str: string):string => Buffer.from(str, 'binary').toString('base64');

  const authKey = encode(combined)

  const testTrackingNum = '6365523030254206'
  // const testTrackingNum = '0000000000000000'


  const args = { carrier: 'CANADAPOST' }
  const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

  console.log(shipments)
  for (const shipment of shipments) {
    const trackingNum = shipment.trackingNumber
    console.log("trackingNum =>", trackingNum)

    try {
      const response = await canadaPost.getTracking(testTrackingNum, authKey)
      parseString(response, (_err, result) => {
        console.log("result =>", result)
        const events = result['tracking-detail']['significant-events'][0]['occurrence']
        console.log('events =>', events)


        let newUpdateTime = new Date(shipment.lastInteractionDate)
        let delivered = false

        if (events) {
          for (const event of events) {
            const timeString = event['event-date'] + 'T' + event['event-time']
            const timestamp = new Date(timeString)

            if (!shipment.lastInteractionDate || timestamp > new Date(shipment.lastInteractionDate)) {
              const interactionDelivered = !!result['actual-delivery-date']
              const interactionMessage = event['event-description'][0]

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

              console.log('status =>', interactionDelivered)
              console.log(interactionMessage)
              console.log(interaction)

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
      })

    } catch (err){
      console.log('err', err)
      continue
    }
  }
}
