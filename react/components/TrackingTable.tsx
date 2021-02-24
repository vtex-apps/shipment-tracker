import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Table } from 'vtex.styleguide'

import GetAllShipments from '../queries/getAllShipments.gql'

const TrackingTable = () => {
  const [items, setItems] = useState<any[]>([])
  const { data } = useQuery(GetAllShipments)

  useEffect(() => {
    if (!data || !data.allShipments) {
      return
    }

    setItems(data.allShipments)
  }, [data])

  const getSchema = () => {
    return {
      properties: {
        orderId: {
          title: 'Order',
        },
        invoiceId: {
          title: 'Invoice',
          cellRenderer: ({ cellData }: any) => {
            return <span className="ws-normal">{cellData}</span>
          },
        },
        lastInteractionDate: {
          title: 'Last Update',
          cellRenderer: ({ cellData }: any) => {
            return <span className={`ws-normal`}>{cellData}</span>
          },
        },
        carrier: {
          title: 'Carrier',
          cellRenderer: ({ cellData }: any) => {
            return <span className={`ws-normal`}>{cellData}</span>
          },
        },
        trackingNumber: {
          title: 'Tracking Number',
          cellRenderer: ({ cellData }: any) => {
            return <span className={`ws-normal`}>{cellData}</span>
          },
        },
        delivered: {
          title: 'Delivered',
          cellRenderer: ({ cellData }: any) => {
            return (
              <span className={`ws-normal`}>
                {cellData ? 'Delivered' : 'In Transit'}
              </span>
            )
          },
        },
      },
    }
  }

  return (
    <div>
      <Table fullWidth items={items} schema={getSchema()} />
    </div>
  )
}

export default TrackingTable
