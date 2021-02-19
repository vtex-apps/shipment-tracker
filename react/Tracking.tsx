import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import TrackingTable from './components/TrackingTable'

import './styles.global.css'

const Tracking: FC = () => {
  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin-example.hello-world" />}
        />
      }
    >
      <PageBlock variation="full">
        <TrackingTable />
      </PageBlock>
    </Layout>
  )
}

export default Tracking
