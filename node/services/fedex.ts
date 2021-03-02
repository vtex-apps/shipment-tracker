import { parseString } from 'xml2js'
import { resolvers } from '../resolvers'

export const fedex = async (settings: FedexConfig, ctx: Context) => {
  const {
    clients: { fedex: fedexClient, oms },
  } = ctx

  // Update to reflect user settings
  // URL needs to be updated for production

  const url = `https://wsbeta.fedex.com:443/web-services`
  console.log(settings)
  const { key, accountNumber, meterNumber, password } = settings
  // const key = 'dIi5YaI9g9OAAvZe'
  // const accountNumber = '510087240'
  // const meterNumber = '100506821'
  // const password = 'yKdWNPN8GVR7dlVuqccu2bCe6'

  // const testTrackingNum = '123456789012'

  const args = { carrier: 'FEDEX' }
  const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

  console.log("shipments =>", shipments)
  for (const shipment of shipments) {
    const trackingNum = shipment.trackingNumber
    console.log(trackingNum)

    const body =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:v16="http://fedex.com/ws/track/v16">
      <soapenv:Header/>
      <soapenv:Body>
      <v16:TrackRequest>
      <v16:WebAuthenticationDetail>
      <v16:ParentCredential>
      <v16:Key>${key}</v16:Key>
      <v16:Password>${password}</v16:Password>
      </v16:ParentCredential>
      <v16:UserCredential>
      <v16:Key>${key}</v16:Key>
      <v16:Password>${password}</v16:Password>
      </v16:UserCredential>
      </v16:WebAuthenticationDetail>
      <v16:ClientDetail>
      <v16:AccountNumber>${accountNumber}</v16:AccountNumber>
      <v16:MeterNumber>${meterNumber}</v16:MeterNumber>
      </v16:ClientDetail>
      <v16:TransactionDetail>
      <v16:CustomerTransactionId>Track By Number_v16</v16:CustomerTransactionId>
      <v16:Localization>
      <v16:LanguageCode>EN</v16:LanguageCode>
      <v16:LocaleCode>US</v16:LocaleCode>
      </v16:Localization>
      </v16:TransactionDetail>
      <v16:Version>
      <v16:ServiceId>trck</v16:ServiceId>
      <v16:Major>16</v16:Major>
      <v16:Intermediate>0</v16:Intermediate>
      <v16:Minor>0</v16:Minor>
      </v16:Version>
      <v16:SelectionDetails>
      <v16:CarrierCode>FDXE</v16:CarrierCode>
      <v16:PackageIdentifier>
      <v16:Type>TRACKING_NUMBER_OR_DOORTAG</v16:Type>
      <v16:Value>${trackingNum}</v16:Value>
      </v16:PackageIdentifier>

      <v16:ShipmentAccountNumber/>

      <v16:SecureSpodAccount/>
      <v16:Destination>
      <v16:GeographicCoordinates>rates evertitque aequora</v16:GeographicCoordinates>
      </v16:Destination>
      </v16:SelectionDetails>
      </v16:TrackRequest>
      </soapenv:Body>
    </soapenv:Envelope>`

    const response = await fedexClient.getTracking(url, body)

    parseString(response, (_err, result) => {
      try {
        result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['TrackReply'][0]['HighestSeverity'][0]
        result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['TrackReply'][0]['CompletedTrackDetails'][0]['TrackDetails'][0]['Events']
      } catch (err) {
        console.log("err =>", err)
        return
      }

      const events = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['TrackReply'][0]['CompletedTrackDetails'][0]['TrackDetails'][0]['Events']
      let delivered = false
      let newLastInteractionDate = new Date(shipment.lastInteractionDate)
      let trackingEvents = []
      let updateFlag = false


      for (const event of events) {
        const timestamp = new Date(event.Timestamp[0])
        const location = event['Address'][0]
        const interactionMessage = event['EventDescription'][0]
        const interactionDelivered = interactionMessage === 'Delivered'
        const [city] = location['City']
        const [state] = location['StateOrProvinceCode']
        const description = interactionMessage
        const date = event.Timestamp[0]

        trackingEvents.push({ city, state, description, date })

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

          if (newLastInteractionDate < timestamp) {
            newLastInteractionDate = timestamp
          }

          resolvers.Mutation.addInteraction(null, interaction, ctx)
        }
      }

      const trackingUpdate = {
        isDelivered: delivered,
        events: trackingEvents.reverse(),
      }

      try {
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
          lastInteractionDate: newLastInteractionDate.toUTCString()
        }
        resolvers.Mutation.updateShipment(null, updateShipment, ctx)
      }
    })
  }
}
