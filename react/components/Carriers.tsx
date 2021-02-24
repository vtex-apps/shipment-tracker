import React, {
  ChangeEvent,
  FC,
  Fragment,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { Button, PageBlock, Input } from 'vtex.styleguide'

import AppSettings from '../queries/appSettings.gql'
import SaveAppSettings from '../queries/saveAppSettings.gql'

import '../styles.global.css'

const initialState = {
  fedex: {
    key: '',
    accountNumber: '',
    meterNumber: '',
    password: '',
  },
  ups: {
    key: '',
  },
  usps: {
    userId: '',
  },
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
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

const Carriers: FC = () => {
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
        payload: {
          ...settings.carriers,
        },
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
        settings: JSON.stringify(settings),
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

export default Carriers
