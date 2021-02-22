/* eslint-disable no-await-in-loop */
import { parseString } from 'xml2js'

import { resolvers } from '../resolvers'
import { CARRIERS } from '../constants'

const USPS_API_LIMIT = 10
const USPS_DELIVERED_STATUS = 'Delivered'

export const uspsTracking = async (settings: UspsConfig, ctx: Context) => {
  const {
    vtex: { account },
    clients: { usps, oms },
  } = ctx

  const userId = `"${settings.userId}"`
  const clientIp = ctx.request.ip
  const sourceId = account
  const pageSize = USPS_API_LIMIT
  let page = 1
  let returned = 0

  do {
    const args = { carrier: CARRIERS.USPS, page, pageSize }
    const shipments = await resolvers.Query.shipmentsByCarrier(null, args, ctx)

    if (shipments.length) {
      const trackingNumbersXml = shipments.map((shipment) => {
        return `<TrackID ID="${shipment.trackingNumber}"/>`
      })

      const xml = `<TrackFieldRequest USERID=${userId}><Revision>1</Revision><ClientIp>${clientIp}</ClientIp><SourceId>${sourceId}</SourceId>${trackingNumbersXml.join(
        ''
      )}</TrackFieldRequest>`

      const xmlResponse = await usps.getTracking(xml)

      let updates: Array<Promise<string | void | OMSOrderTracking>> = []

      parseString(xmlResponse, async (_err, response: UspsParsedResult) => {
        const trackingItems = response.TrackResponse.TrackInfo

        updates = trackingItems.reduce(
          (
            promises: Array<Promise<string | void | OMSOrderTracking>>,
            trackingInfo
          ) => {
            const matchedShipment = shipments.find((shipment) => {
              return shipment.trackingNumber === trackingInfo?.$.ID
            })

            if (!matchedShipment?.id) {
              return promises
            }

            const shipmentId = matchedShipment.id
            const lastShipmentUpdate = new Date(
              matchedShipment.lastInteractionDate
            )
            const [status] = trackingInfo.StatusCategory
            const isDelivered = status === USPS_DELIVERED_STATUS
            const [trackSummary] = trackingInfo.TrackSummary

            const trackingDate = new Date(
              `${trackSummary.EventDate} ${trackSummary.EventTime}`
            )

            if (trackingDate <= lastShipmentUpdate) {
              return promises
            }

            const [city] = trackSummary.EventCity
            const [state] = trackSummary.EventState
            const [description] = trackSummary.Event
            const [date] = trackSummary.EventDate
            const event = {
              city,
              state,
              description,
              date,
            }

            promises.push(
              oms.updateOrderTracking(
                matchedShipment.orderId,
                matchedShipment.invoiceId,
                {
                  isDelivered,
                  events: [event],
                }
              )
            )

            const interaction: AddInteractionArgs = {
              shipmentId,
              delivered: isDelivered,
            }

            promises.push(
              resolvers.Mutation.addInteraction(null, interaction, ctx)
            )

            const shipment = {
              id: matchedShipment.id,
              lastInteractionDate: trackingDate.toUTCString(),
            }

            promises.push(
              resolvers.Mutation.updateShipment(null, shipment, ctx)
            )

            return promises
          },
          []
        )
      })

      try {
        if (updates) {
          const result = await Promise.allSettled(updates)
          console.log('promise all', result)
        }
      } catch (err) {
        console.log('err', err)
      }
    }

    page++
    returned = shipments.length || 0
  } while (returned === 10)
}
