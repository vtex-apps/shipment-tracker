/* eslint-disable no-await-in-loop */
import { parseString } from 'xml2js'

import { resolvers } from '../resolvers'
import { CARRIERS } from '../constants'

const USPS_API_LIMIT = 10
const USPS_DELIVERED_STATUS = 'Delivered'

export const usps = async (settings: UspsConfig, ctx: Context) => {
  const {
    vtex: { account },
    clients: { usps: uspsClient, oms },
  } = ctx

  const userId = `"${settings.userId}"`
  const clientIp = ctx.request.ip
  const sourceId = account
  const pageSize = USPS_API_LIMIT
  let returned = 0
  let createdBefore = null

  do {
    const args = { carrier: CARRIERS.USPS, pageSize, createdBefore }
    const shipments: Shipment[] = await resolvers.Query.shipmentsByCarrier(
      null,
      args,
      ctx
    )

    if (shipments.length) {
      const oldestDate = new Date(shipments[shipments.length - 1].createdIn)
      oldestDate.setSeconds(oldestDate.getSeconds() - 1)
      createdBefore = oldestDate.toISOString()

      const trackingNumbersXml = shipments.map((shipment) => {
        return `<TrackID ID="${shipment.trackingNumber}"/>`
      })

      const xml = `<TrackFieldRequest USERID=${userId}><Revision>1</Revision><ClientIp>${clientIp}</ClientIp><SourceId>${sourceId}</SourceId>${trackingNumbersXml.join(
        ''
      )}</TrackFieldRequest>`

      const xmlResponse = await uspsClient.getTracking(xml)

      let updates: Array<Promise<string | void | OMSOrderTracking>> = []

      parseString(xmlResponse, async (_err, result: UspsParsedResult) => {
        const trackingItems = result.TrackResponse.TrackInfo

        updates = trackingItems.reduce(
          (
            promises: Array<Promise<string | void | OMSOrderTracking>>,
            trackingInfo
          ) => {
            const matchedShipment = shipments.find((shipment) => {
              return shipment.trackingNumber === trackingInfo?.$.ID
            })

            // console.log('matchedShipment', matchedShipment)
            // console.log('trackingSummary', trackingInfo.TrackSummary)
            if (!matchedShipment?.id || !trackingInfo.StatusCategory) {
              return promises
            }
            console.log('matched', matchedShipment?.orderId)

            const shipmentId = matchedShipment.id
            const [status] = trackingInfo.StatusCategory
            const isDelivered = status === USPS_DELIVERED_STATUS
            const [trackSummary] = trackingInfo.TrackSummary
            const trackingEvents: TrackingEvent[] = []

            if (trackSummary) {
              const [city] = trackSummary.EventCity
              const [state] = trackSummary.EventState
              const [description] = trackSummary.Event
              const [date] = trackSummary.EventDate

              trackingEvents.push({ city, state, description, date })
            }

            if (trackingInfo.TrackDetail) {
              const pastEvents = trackingInfo.TrackDetail.map((event) => {
                const [city] = event.EventCity
                const [state] = event.EventState
                const [description] = event.Event
                const [date] = event.EventDate

                return { city, state, description, date }
              })

              trackingEvents.push(...pastEvents)
            }

            const trackingUpdate = {
              isDelivered,
              events: trackingEvents.reverse(),
            }
            // console.log('tracking update', trackingUpdate)

            promises.push(
              oms.updateOrderTracking(
                matchedShipment.orderId,
                matchedShipment.invoiceId,
                trackingUpdate
              )
            )

            const interaction: AddInteractionArgs = {
              shipmentId,
              delivered: isDelivered,
            }

            // console.log('interaction', interaction)

            promises.push(
              resolvers.Mutation.addInteraction(null, interaction, ctx)
            )

            const shipment = {
              id: matchedShipment.id,
              delivered: isDelivered,
            }

            // console.log('update shipment', shipment)

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
          await Promise.allSettled(updates)
        }
      } catch (err) {
        console.log('err', err)
      }
    }

    returned = shipments.length || 0
  } while (returned === USPS_API_LIMIT)
}
