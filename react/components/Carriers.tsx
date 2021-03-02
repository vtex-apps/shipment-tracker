import React, {
  ChangeEvent,
  FC,
  Fragment,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { useMutation, useQuery } from 'react-apollo'
import { Button, PageBlock, Input } from 'vtex.styleguide'

import AppSettings from '../queries/appSettings.gql'
import SaveAppSettings from '../queries/saveAppSettings.gql'

import '../styles.global.css'

const initialState = {
  canadaPost: {
    userId: '',
    password: '',
    active: false,
  },
  fedex: {
    key: '',
    accountNumber: '',
    meterNumber: '',
    password: '',
    active: false,
  },
  ups: {
    key: '',
    active: false,
  },
  usps: {
    userId: '',
    active: false,
  },
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'canadaPost':
      return {
        ...state,
        canadaPost: { ...state.canadaPost, ...action.payload },
      }
    case 'fedex':
      return { ...state, fedex: { ...state.fedex, ...action.payload } }
    case 'ups':
      return { ...state, ups: { ...state.ups, ...action.payload } }
    case 'usps':
      return { ...state, usps: { ...state.usps, ...action.payload } }
    case 'setConfig':
      return { ...state, ...action.payload }
    default:
      throw new Error()
  }
}

const markActive = (settings: any) => {
  const {
    usps: { userId: uspsUserId },
    ups: { key: upsKey },
    fedex: { key: fedexKey },
    canadaPost: { userId: canadaPostUserId },
  } = settings.carriers

  settings.carriers.usps.active = !!uspsUserId
  settings.carriers.ups.active = !!upsKey
  settings.carriers.fedex.active = !!fedexKey
  settings.carriers.canadaPost.active = !!canadaPostUserId

  return settings
}

const Carriers: FC<any> = ({ intl }) => {
  const messages = defineMessages({
    title: {
      id: 'admin/carrier.title',
      defaultMessage: 'Carrier',
    },
    save: {
      id: 'admin/carrier.save.label',
      defaultMessage: 'Save',
    },
    canadaPost: {
      id: 'admin/carrier.canadapost.label',
      defaultMessage: 'Canada Post',
    },
    canadaPostId: {
      id: 'admin/carrier.canadapost.id.label',
      defaultMessage: 'User ID',
    },
    canadaPostPassword: {
      id: 'admin/carrier.canadapost.password.label',
      defaultMessage: 'Account Password',
    },
    fedex: {
      id: 'admin/carrier.fedex.label',
      defaultMessage: 'Fedex',
    },
    fedexKey: {
      id: 'admin/carrier.fedex.key.label',
      defaultMessage: 'Key',
    },
    fedexAccountNumber: {
      id: 'admin/carrier.fedex.account-number.label',
      defaultMessage: 'Account Number',
    },
    fedexMeterNumber: {
      id: 'admin/carrier.fedex.meter-number.label',
      defaultMessage: 'Meter Number',
    },
    fedexPassword: {
      id: 'admin/carrier.fedex.password.label',
      defaultMessage: 'Password',
    },
    ups: {
      id: 'admin/carrier.ups.label',
      defaultMessage: 'UPS',
    },
    upsKey: {
      id: 'admin/carrier.ups.key.label',
      defaultMessage: 'Key',
    },
    usps: {
      id: 'admin/carrier.usps.label',
      defaultMessage: 'USPS',
    },
    uspsUserID: {
      id: 'admin/carrier.usps.userID.label',
      defaultMessage: 'User ID',
    },
  })

  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useState<any>(null)
  const [saveSettings] = useMutation(SaveAppSettings)
  const [state, dispatch] = useReducer(reducer, initialState)
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

    if (settings.carriers) {
      dispatch({
        type: 'setConfig',
        payload: settings.carriers,
      })
    }
  }, [data])

  const handleSave = async () => {
    setLoading(true)
    if (!appSettings) {
      return
    }
    const settings = appSettings

    settings.carriers = {
      ...settings.carriers,
      ...state,
    }

    await saveSettings({
      variables: {
        version: process.env.VTEX_APP_VERSION,
        settings: JSON.stringify(markActive(settings)),
      },
    })
    setLoading(false)
  }

  return (
    <Fragment>
      <div className="mt5" />
      <PageBlock
        title="Carriers"
        variation="full"
        titleAside={
          <div className="flex justify-end">
            <div className="w-40 mb5">
              <Button
                isLoading={loading}
                onClick={() => handleSave()}
                variation="primary"
              >
                Save
              </Button>
            </div>
          </div>
        }
      >
        <PageBlock title="Canada Post" variation="full">
          <div className="mb5">
            <Input
              value={state.canadaPost.userId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'canadaPost',
                  payload: { userId: e.target.value },
                })
              }}
              placeholder="User ID"
              label="User ID"
            />
          </div>
          <div className="mb5">
            <Input
              value={state.canadaPost.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: 'canadaPost',
                  payload: { password: e.target.value },
                })
              }
              placeholder="Account Password"
              label="Account Password"
            />
          </div>
        </PageBlock>
        <PageBlock title="FedEx" variation="full">
          <div className="mb5">
            <Input
              value={state.fedex.key}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                dispatch({ type: 'fedex', payload: { key: e.target.value } })
              }}
              placeholder="Key"
              label="Key"
            />
          </div>
          <div className="mb5">
            <Input
              value={state.fedex.accountNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: 'fedex',
                  payload: { accountNumber: e.target.value },
                })
              }
              placeholder="Account Number"
              label="Account Number"
            />
          </div>
          <div className="mb5">
            <Input
              value={state.fedex.meterNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: 'fedex',
                  payload: { meterNumber: e.target.value },
                })
              }
              placeholder="Meter Number"
              label="Meter Number"
            />
          </div>
          <div className="mb5">
            <Input
              value={state.fedex.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatch({
                  type: 'fedex',
                  payload: { password: e.target.value },
                })
              }
              placeholder="Password"
              label="Password"
            />
          </div>
        </PageBlock>
        <PageBlock title="UPS" variation="full">
          <Input
            value={state.ups.key}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: 'ups', payload: { key: e.target.value } })
            }
            placeholder="Key"
            label="Key"
          />
        </PageBlock>
        <PageBlock title="USPS" variation="full">
          <Input
            value={state.usps.userId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: 'usps', payload: { userId: e.target.value } })
            }
            placeholder="USPS Web Tools User ID"
            label="User ID"
          />
        </PageBlock>
      </PageBlock>
    </Fragment>
  )
}

export default injectIntl(Carriers)
