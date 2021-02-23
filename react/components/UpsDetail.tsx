import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Layout, PageHeader, Button, PageBlock, Input } from 'vtex.styleguide'

import AppSettings from '../queries/appSettings.gql'
import SaveAppSettings from '../queries/saveAppSettings.gql'

import '../styles.global.css'

const UpsDetail: FC = () => {
  const { navigate } = useRuntime()
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useState<any>(null)
  const [fields, setFields] = useState({
    key: '',
  })
  const [saveSettings] = useMutation(SaveAppSettings)
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

    if (settings.carriers?.ups) {
      setFields({ ...fields, ...settings.carriers.ups })
    }
  }, [data])

  const handleSave = async () => {
    setLoading(true)
    if (!appSettings) {
      return
    }
    const settings = appSettings
    const active = fields.key.length > 0

    settings.carriers.ups = {
      ...settings.carriers.ups,
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
          title={appSettings?.carriers.ups.name}
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
      </PageBlock>
    </Layout>
  )
}

export default UpsDetail
