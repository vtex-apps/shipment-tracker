import { usps } from './usps'
import { fedex } from './fedex'
import { ups } from './ups'
import { canadaPost } from './canadaPost'

export const trackingService = {
  usps,
  ups,
  fedex,
  canadaPost,
}
