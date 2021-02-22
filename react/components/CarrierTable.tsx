import React, { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  IconEdit,
  PageBlock,
  ButtonWithIcon,
} from 'vtex.styleguide'
import { Link } from 'vtex.render-runtime'
import { useQuery } from 'react-apollo'

import Config from '../queries/config.gql'

const schema = {
  properties: {
    name: {
      title: 'Name',
    },
    active: {
      title: 'Status',
      cellRenderer: ({ cellData: isActive }: any) => {
        const type = isActive ? 'success' : 'default'

        return (
          <Tag type={type}>
            <span>{isActive ? 'Active' : 'Inactive'}</span>
          </Tag>
        )
      },
    },
    path: {
      title: 'Action',
      cellRenderer: ({ cellData }: any) => {
        return (
          <div className="flex">
            <div className="mr2">
              <Link
                page={`admin.app.shipping-tracker-carrier`}
                params={{ id: cellData }}
              >
                <ButtonWithIcon icon={<IconEdit />} variation="tertiary" />
              </Link>
            </div>
          </div>
        )
      },
    },
  },
}

const CarrierTable = () => {
  const [carriers, setCarriers] = useState<any>([])

  const { data } = useQuery(Config, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  useEffect(() => {
    if (!data) {
      return
    }
    setCarriers(data.config.carriers)
  }, [data])

  if (!carriers) {
    return null
  }

  return (
    <div>
      <PageBlock variation="full" title="Carriers">
        <Table fullWidth schema={schema} items={carriers} />
      </PageBlock>
    </div>
  )
}

export default CarrierTable
