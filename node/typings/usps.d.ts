interface UspsParsedResult {
  TrackResponse: TrackResponse
}

interface TrackResponse {
  TrackInfo: TrackInfo[]
}

interface TrackInfo {
  $: { ID: string }
  Class: [string]
  ClassOfMailCode: [string]
  DestinationCity: [string]
  DestinationCountryCode: [string]
  DestinationState: [string]
  DestinationZip: [string]
  EmailEnabled: [string]
  KahalaIndicator: [string]
  MailTypeCode: [string]
  MPDATE: [string]
  MPSUFFIX: [string]
  OriginCity: [string]
  OriginCountryCode: [string]
  PodEnabled: [string]
  TPodEnabled: [string]
  RestoreEnabled: [string]
  RramEnabled: [string]
  RreEnabled: [string]
  Service: [string]
  ServiceTypeCode: [string]
  Status: [string]
  StatusCategory: [string]
  StatusSummary: [string]
  TABLECODE: [string]
  TrackSummary: [TrackDetail]
  TrackDetail?: TrackDetail[]
}

interface TrackDetail {
  EventTime: [string]
  EventDate: [string]
  Event: [string]
  EventCity: [string]
  EventState: [string]
  EventZIPCode: [string]
  EventCountry: [string]
  FirmName: [string]
  Name: [string]
  AuthorizedAgent: [string]
  EventCode: [string]
}
