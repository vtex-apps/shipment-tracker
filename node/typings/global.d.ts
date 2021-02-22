interface AppSettings {
  schema: boolean
  schemaVersion: string
  title: string
  carriers: Carriers
}

interface Carriers {
  fedex: FedexConfig
  usps: UspsConfig
  ups: UpsConfig
}

interface CarrierConfig {
  active: boolean
  name: string
  path: string
}

interface FedexConfig extends CarrierConfig {
  key: string
  accountNumber: string
  meterNumber: string
  password: string
}

interface UpsConfig extends CarrierConfig {
  key: string
}

interface UspsConfig extends CarrierConfig {
  userId: string
}
