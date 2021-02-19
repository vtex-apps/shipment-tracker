import React, { FC } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import AppSettings from './queries/appSettings.gql'
import CarrierTable from './components/CarrierTable'

import './styles.global.css'

const AdminExample: FC = () => {
  const { data } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin-example.hello-world" />}
        />
      }
    >
      <PageBlock variation="full">
        <CarrierTable />
      </PageBlock>
    </Layout>
  )
}

export default AdminExample
