import { Service, ClientsConfig, ParamsContext, RecorderState, ServiceContext } from '@vtex/api'

import { Clients } from './clients'
import { resolvers } from './resolvers'

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients>

}

export default new Service<Clients, RecorderState, ParamsContext>({
  clients,
  graphql: {
    resolvers,
  },
})
