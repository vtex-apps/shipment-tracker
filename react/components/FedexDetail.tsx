import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Layout, PageHeader, Button, PageBlock, Input } from 'vtex.styleguide'

import AppSettings from '../queries/appSettings.gql'
import SaveAppSettings from '../queries/saveAppSettings.gql'

import '../styles.global.css'

const FedexDetail: FC = () => {
  const { navigate } = useRuntime()
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useState<any>(null)
  const [saveSettings] = useMutation(SaveAppSettings)
  const [fields, setFields] = useState({
    key: '',
    accountNumber: '',
    meterNumber: '',
    password: '',
  })
  const { data } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
  })

  useEffect(() => {
    if (!data) {
      return
    }

    const settings = JSON.parse(data.appSettings.message)
    setAppSettings(settings)

    if (settings.carriers?.fedex) {
      setFields({ ...fields, ...settings.carriers.fedex })
    }
  }, [data])

  const handleSave = async () => {
    setLoading(true)
    if (!appSettings) {
      return
    }
    const settings = appSettings
    const active = fields.key.length > 0

    settings.carriers.fedex = {
      ...settings.carriers.fedex,
      ...fields,
      active,
    }

    await saveSettings({
      variables: {
        version: process.env.VTEX_APP_VERSION,
        settings: JSON.stringify(settings),
      },
    })
    setLoading(false)
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={appSettings?.carriers.fedex.name}
          linkLabel="BACK TO PREVIOUS PAGE"
          onLinkClick={() =>
            navigate({
              page: 'admin.app.shipping-tracker',
            })
          }
        >
          <Button
            isLoading={loading}
            onClick={() => handleSave()}
            variation="primary"
          >
            Save
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <div className="mb5">
          <Input
            value={fields.key}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFields({ ...fields, key: e.target.value })
            }
            placeholder="Key"
            label="Key"
          />
        </div>
        <div className="mb5">
          <Input
            value={fields.accountNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFields({ ...fields, accountNumber: e.target.value })
            }
            placeholder="Account Number"
            label="Account Number"
          />
        </div>
        <div className="mb5">
          <Input
            value={fields.meterNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFields({ ...fields, meterNumber: e.target.value })
            }
            placeholder="Meter Number"
            label="Meter Number"
          />
        </div>
        <div className="mb5">
          <Input
            value={fields.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFields({ ...fields, password: e.target.value })
            }
            placeholder="Password"
            label="Password"
          />
        </div>
      </PageBlock>
    </Layout>
  )
}

export default FedexDetail
