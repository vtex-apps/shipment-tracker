/* eslint-disable no-await-in-loop */
import { parseString } from 'xml2js'

import { resolvers } from '../resolvers'
import { CARRIERS } from '../typings/constants'

const USPS_API_LIMIT = 10
const USPS_DELIVERED_STATUS = 'Delivered'

export const uspsTracking = async (ctx: Context) => {
  const {
    vtex: { account },
    clients: { apps, usps },
  } = ctx

  const appId = process.env.VTEX_APP_ID
  const settings = appId && (await apps.getAppSettings(appId))

  const userId = `"${settings.carriers.usps.userId}"`
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

      let promises: Array<Promise<string | void>> = []

      parseString(xmlResponse, async (_err, response: UspsParsedResult) => {
        const trackingItems = response.TrackResponse.TrackInfo

        promises = trackingItems.reduce(
          (interactions: Array<Promise<string | void>>, trackingInfo) => {
            const matchedShipment = shipments.find((shipment) => {
              return shipment.trackingNumber === trackingInfo?.$.ID
            })

            if (!matchedShipment?.id) {
              return interactions
            }

            const shipmentId = matchedShipment.id
            const lastShipmentUpdate = new Date(
              matchedShipment.lastInteractionDate
            )
            const [status] = trackingInfo.StatusCategory
            const delivered = status === USPS_DELIVERED_STATUS
            const [trackSummary] = trackingInfo.TrackSummary

            const trackingDate = new Date(
              `${trackSummary.EventDate} ${trackSummary.EventTime}`
            )

            if (trackingDate <= lastShipmentUpdate) {
              return interactions
            }

            const interaction: AddInteractionArgs = {
              shipmentId,
              delivered,
            }

            interactions.push(
              resolvers.Mutation.addInteraction(null, interaction, ctx)
            )

            // TODO update orderAPI

            const shipment = {
              id: matchedShipment.id,
              lastInteractionDate: trackingDate.toUTCString(),
            }

            interactions.push(
              resolvers.Mutation.updateShipment(null, shipment, ctx)
            )

            return interactions
          },
          []
        )
      })

      try {
        if (promises) {
          await Promise.all(promises)
        }
      } catch (err) {
        console.log('err', err)
      }
    }

    page++
    returned = shipments.length || 0
  } while (returned === 10)
}
