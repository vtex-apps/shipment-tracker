import { IOClients } from '@vtex/api'

import OMSClient from './oms'
import RequestHub from '../utils/Hub'
import SchedulerClient from './scheduler'
import USPSClient from './usps'
import FedExClient from './fedex'
import UPSClient from './ups'
import CanadaPostClient from './canadaPost'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get hub() {
    return this.getOrSet('hub', RequestHub)
  }

  public get oms() {
    return this.getOrSet('orders', OMSClient)
  }

  public get scheduler() {
    return this.getOrSet('scheduler', SchedulerClient)
  }

  public get usps() {
    return this.getOrSet('usps', USPSClient)
  }

  public get fedex() {
    return this.getOrSet('fedex', FedExClient)
  }

  public get ups() {
    return this.getOrSet('ups', UPSClient)
  }

  public get canadaPost() {
    return this.getOrSet('canadaPost', CanadaPostClient)
  }
}
