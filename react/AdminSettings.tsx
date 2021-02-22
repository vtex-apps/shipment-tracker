import React from 'react'
import { useRuntime } from 'vtex.render-runtime'

import FedexDetail from './components/FedexDetail'
import UpsDetail from './components/UpsDetail'
import UspsDetail from './components/UspsDetail'

import './styles.global.css'

const AdminSettings = () => {
  const { history, navigate } = useRuntime()

  const carrier = history?.location.state.navigationRoute.params?.id

  if (!carrier || !history) {
    return null
  }

  switch (carrier) {
    case 'usps':
      return <UspsDetail />
    case 'fedex':
      return <FedexDetail />
    case 'ups':
      return <UpsDetail />
    default:
      navigate({
        page: 'admin.app.shipping-tracker',
      })
      return null
  }
}

export default AdminSettings
