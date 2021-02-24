/* eslint-disable no-console */
import { Apps } from '@vtex/api'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}
const SCHEMA_VERSION = 'v0.8'
const schemaShipments = {
  properties: {
    trackingNumber: {
      type: 'string',
      title: 'Tracking Number',
    },
    carrier: {
      type: 'string',
      title: 'Carrier',
    },
    delivered: {
      type: 'boolean',
      title: 'Delivery Status',
    },
    orderId: {
      type: 'string',
      title: 'Order ID',
    },
    invoiceId: {
      type: 'string',
      title: 'Invoice ID',
    },
    externalLink: {
      type: 'string',
      title: 'External Id',
    },
    lastInteractionDate: {
      type: 'string',
      title: 'Last Interaction Date',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': [
    'trackingNumber',
    'carrier',
    'delivered',
    'orderId',
    'invoiceId',
    'lastInteractionDate',
    'creationDate',
  ],
  'v-default-fields': [
    'trackingNumber',
    'carrier',
    'delivered',
    'orderId',
    'invoiceId',
    'lastInteractionDate',
    'creationDate',
  ],
  'v-cache': false,
}
const schemaInteractions = {
  properties: {
    shipmentId: {
      type: 'string',
      title: 'Shipment ID',
    },
    interaction: {
      type: 'string',
      title: 'Interaction',
    },
    delivered: {
      type: 'boolean',
      title: 'Delivery Status',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': ['shipmentId', 'interaction', 'status', 'creationDate'],
  'v-default-fields': ['shipmentId', 'interaction', 'status', 'creationDate'],
  'v-cache': false,
}

const routes = {
  baseUrl: (account: string) =>
    `http://${account}.vtexcommercestable.com.br/api`,

  shipmentEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/shipment`,

  interactionEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/interaction`,

  saveSchemaShipment: (account: string) =>
    `${routes.shipmentEntity(account)}/schemas/${SCHEMA_VERSION}`,

  saveSchemaInteraction: (account: string) =>
    `${routes.interactionEntity(account)}/schemas/${SCHEMA_VERSION}`,
}

const defaultHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vtex.ds.v10+json',
  VtexIdclientAutCookie: authToken,
  'Proxy-Authorization': authToken,
})

export const resolvers = {
  Query: {
    viewSchedule: async (
      _: void,
      _args: void,
      ctx: Context
    ): Promise<ViewSchedulerGraphQL | null> => {
      const {
        clients: { scheduler },
      } = ctx

      let response

      try {
        response = await scheduler.viewSchedule()
      } catch (_err) {
        return null
      }

      const { NextExecution: nextExecution, lastInteractionIn } = response

      console.log('view schedule', response)

      return {
        nextExecution,
        lastInteractionIn,
      }
    },
    config: async (_: any, __: any, ctx: any) => {
      const {
        vtex: { account, authToken },
        clients: { hub },
      } = ctx

      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      let settings = await apps.getAppSettings(app)
      const defaultSettings = {
        schema: false,
        schemaVersion: null,
        title: 'Shipment Tracking',
      }

      if (!settings.title) {
        settings = defaultSettings
      }

      let schemaError = false

      if (!settings.schema || settings.schemaVersion !== SCHEMA_VERSION) {
        try {
          const url = routes.saveSchemaShipment(account)
          const headers = defaultHeaders(authToken)

          await hub.put(url, schemaShipments, headers)
        } catch (e) {
          if (e.response.status >= 400) {
            console.log(e.response)
            schemaError = true
          }
        }

        if (!schemaError) {
          try {
            const url = routes.saveSchemaInteraction(account)
            const headers = defaultHeaders(authToken)

            await hub.put(url, schemaInteractions, headers)
          } catch (e) {
            if (e.response.status >= 400) {
              schemaError = true
            }
          }
        }

        settings.schema = !schemaError
        settings.schemaVersion = !schemaError ? SCHEMA_VERSION : null

        await apps.saveAppSettings(app, settings)
      }

      return settings
    },
    allShipments: async (_: any, __: any, ctx: Context) => {
      const {
        clients: { masterdata },
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'shipment',
        fields: [
          'id',
          'trackingNumber',
          'carrier',
          'delivered',
          'orderId',
          'invoiceId',
          'externalLink',
          'lastInteractionDate',
          'createdIn',
          'updatedIn',
        ],
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      return result
    },
    interactions: async (_: any, args: any, ctx: Context) => {
      const {
        clients: { masterdata },
      } = ctx

      console.log(args)

      const result = await masterdata.searchDocuments({
        dataEntity: 'interaction',
        fields: [
          'id',
          'shipmentId',
          'interaction',
          'delivered',
          'updatedIn',
          'createdIn',
        ],
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `shipmentId=${args.shipmentId}`,
        schema: SCHEMA_VERSION,
      })

      return result
    },
    shipment: async (_: any, args: any, ctx: Context) => {
      const {
        clients: { masterdata },
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'shipment',
        fields: [
          'id',
          'trackingNumber',
          'carrier',
          'delivered',
          'orderId',
          'invoiceId',
          'externalLink',
          'lastInteractionDate',
          'createdIn',
          'updatedIn',
        ],
        where: `id=${args.id}`,
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      console.log('create', result)

      return result
    },
    shipmentsByCarrier: async (
      _: any,
      args: ShipmentsByCarrierArgs,
      ctx: Context
    ) => {
      const {
        clients: { masterdata },
      } = ctx

      const { carrier, page = 1, pageSize = 99 } = args

      const result = await masterdata.searchDocuments<Shipment>({
        dataEntity: 'shipment',
        fields: [
          'id',
          'trackingNumber',
          'carrier',
          'delivered',
          'orderId',
          'invoiceId',
          'externalLink',
          'lastInteractionDate',
          'createdIn',
          'updatedIn',
        ],
        where: `carrier=${carrier} AND delivered=false`,
        pagination: {
          page,
          pageSize,
        },
        schema: SCHEMA_VERSION,
      })

      return result
    },
  },
  Mutation: {
    addShipment: async (
      _: any,
      args: AddShipmentArgs,
      ctx: Context | StatusChangeContext
    ) => {
      const {
        clients: { masterdata },
      } = ctx

      return masterdata
        .createDocument({
          dataEntity: 'shipment',
          fields: args,
          schema: SCHEMA_VERSION,
        })
        .then((res) => {
          return res.DocumentId
        })
        .catch((err: any) => {
          console.log('err', err)
          return err.response.message
        })
    },
    updateShipment: async (
      _: any,
      args: UpdateShipmentArgs,
      ctx: Context | StatusChangeContext
    ) => {
      const {
        clients: { masterdata },
      } = ctx

      const { id, ...fields } = args

      return masterdata
        .updatePartialDocument({
          dataEntity: 'shipment',
          id,
          fields,
          schema: SCHEMA_VERSION,
        })
        .then((_res) => {
          return id
        })
        .catch((err: any) => {
          console.log('err', err)
          return err.response.message
        })
    },
    addInteraction: async (_: any, args: AddInteractionArgs, ctx: Context) => {
      const {
        clients: { masterdata },
      } = ctx

      return masterdata
        .createDocument({
          dataEntity: 'interaction',
          fields: args,
          schema: SCHEMA_VERSION,
        })
        .then((res) => {
          return res.DocumentId
        })
        .catch((err: any) => {
          return err.response.message
        })
    },
    createSchedule: async (
      _: void,
      _args: void,
      ctx: Context
    ): Promise<CreateSchedulerResponse> => {
      const {
        clients: { scheduler },
        vtex: { workspace, account },
      } = ctx

      const schedulerData = {
        id: `vtex-shipping-tracker`,
        scheduler: {
          expression: '0 6 * * *',
          endDate: '2029-12-30T23:29:00',
        },
        request: {
          method: 'GET',
          uri: `https://${workspace}--${account}.myvtex.com/_v/api/tracking/update`,
        },
      }

      const response = await scheduler.createSchedule(schedulerData)

      console.log('create schedule', response)

      return response
    },
    deleteSchedule: async (
      _: void,
      _args: void,
      ctx: Context
    ): Promise<boolean> => {
      const {
        clients: { scheduler },
      } = ctx

      const response = await scheduler.deleteSchedule()

      console.log('delete schedule', response)

      return true
    },
  },
}
