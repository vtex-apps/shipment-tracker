import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import { Layout, PageHeader, Button, PageBlock, Input } from 'vtex.styleguide'

import AppSettings from '../queries/appSettings.gql'
import SaveAppSettings from '../queries/saveAppSettings.gql'

import '../styles.global.css'

const UspsDetail: FC = () => {
  const { navigate } = useRuntime()
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useState<any>(null)
  const [fields, setFields] = useState({
    userId: '',
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

    if (settings.carriers?.usps) {
      setFields(settings.carriers.usps)
    }
  }, [data])

  const handleSave = async () => {
    setLoading(true)

    if (!appSettings) {
      return
    }
    const settings = appSettings
    const active = fields.userId.length > 0

    settings.carriers.usps = {
      ...settings.carriers.usps,
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
          title={appSettings?.carriers.usps.name}
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
            value={fields.userId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFields({ userId: e.target.value })
            }
            placeholder="USPS Web Tools User ID"
            label="User ID"
          />
        </div>
      </PageBlock>
    </Layout>
  )
}

export default UspsDetail
