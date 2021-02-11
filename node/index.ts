import {
  Service,
  ClientsConfig,
  ParamsContext,
  RecorderState,
  ServiceContext,
  EventContext,
} from '@vtex/api'

import { Clients } from './clients'
import { resolvers } from './resolvers'
import { orderStatusChange } from './events/orderStatusChange'
import { updateTracking } from './routes/updateTracking'

const TIMEOUT_MS = 800

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
}
declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients>

  interface StatusChangeContext extends EventContext<Clients> {
    body: {
      domain: string
      orderId: string
      currentState: string
      lastState: string
      currentChangeDate: string
      lastChangeDate: string
    }
  }
  type State = RecorderState
}

export default new Service<Clients, RecorderState, ParamsContext>({
  clients,
  graphql: {
    resolvers,
  },
  events: {
    orderStatusChange,
  },
  routes: {
    updateTracking,
  },
})
