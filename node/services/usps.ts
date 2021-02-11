import { parseString } from 'xml2js'

export const uspsTracking = async (ctx: Context) => {
  const {
    clients: { usps },
  } = ctx

  // Get USPS orders

  // Fetch and update
  const userId = '"userId"'
  const clientIp = '122.3.3'
  const sourceId = 'VTEX'
  const trackId = '"tracking#"'

  const xml = `<TrackFieldRequest USERID=${userId}><Revision>1</Revision><ClientIp>${clientIp}</ClientIp><SourceId>${sourceId}</SourceId><TrackID ID=${trackId}/></TrackFieldRequest>`

  const response = await usps.getTracking(xml)

  parseString(response, (_err, result) => {
    console.log(result.TrackResponse.TrackInfo)
  })

  // update masterdata
  // update orderAPI
}
