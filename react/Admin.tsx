import React, { FC, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { injectIntl, defineMessages } from 'react-intl'
import {
  Layout,
  PageBlock,
  PageHeader,
  Toggle,
  Tabs,
  Tab,
} from 'vtex.styleguide'

import ViewSchedule from './queries/viewSchedule.gql'
import DeleteSchedule from './queries/deleteSchedule.gql'
import CreateSchedule from './queries/createSchedule.gql'
import Carriers from './components/Carriers'

import './styles.global.css'

const AdminExample: FC<any> = ({ intl }) => {
  const messages = defineMessages({
    title: {
      id: 'admin/tracking.title',
      defaultMessage: 'Shipment Tracker',
    },
    settingsTab: {
      id: 'admin/tracking.settings.tab.label',
      defaultMessage: 'Settings',
    },
    scheduleLabel: {
      id: 'admin/tracking.schedule.label',
      defaultMessage: 'Update Schedule',
    },
    lastSchedule: {
      id: 'admin/tracking.last-schedule.label',
      defaultMessage: 'Last Schedule Run:',
    },
    nextSchedule: {
      id: 'admin/tracking.next-schedule.label',
      defaultMessage: 'Next Schedule Run:',
    },
    active: {
      id: 'admin/tracking.active.label',
      defaultMessage: 'Active',
    },
    inactive: {
      id: 'admin/tracking.inactive.label',
      defaultMessage: 'Inactive',
    },
  })
  const [activeTab, setActiveTab] = useState<number>(1)
  const [schedule, setSchedule] = useState<null | Schedule>(null)
  const [
    deleteSchedule,
    { loading: deleteLoading, data: deleteResponse },
  ] = useMutation(DeleteSchedule)
  const [
    createSchedule,
    { loading: createLoading, data: createResponse },
  ] = useMutation<ScheduleCreateResponse>(CreateSchedule)
  const {
    data: scheduleData,
    loading: viewLoading,
    called: viewCalled,
  } = useQuery<ScheduleViewResponse>(ViewSchedule)

  useEffect(() => {
    if (scheduleData?.viewSchedule) {
      setSchedule(scheduleData.viewSchedule)
    } else {
      setSchedule(null)
    }
  }, [scheduleData])

  useEffect(() => {
    if (deleteResponse) {
      setSchedule(null)
    }
  }, [deleteResponse])

  useEffect(() => {
    if (createResponse?.createSchedule) {
      setSchedule(createResponse.createSchedule)
    }
  }, [createResponse])

  const handleChange = () => {
    if (schedule) {
      return deleteSchedule()
    }

    return createSchedule()
  }

  if (!viewCalled || viewLoading) {
    return null
  }

  return (
    <Layout
      pageHeader={<PageHeader title={intl.formatMessage(messages.title)} />}
    >
      <Tabs fullWidth>
        <Tab
          label={intl.formatMessage(messages.settingsTab)}
          active={activeTab === 1}
          onClick={() => setActiveTab(1)}
        >
          <div className="mt5" />
          <PageBlock
            title={intl.formatMessage(messages.scheduleLabel)}
            variation="full"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex">
                  <div className="mr4">
                    {intl.formatMessage(messages.lastSchedule)}
                  </div>
                  {`${
                    schedule?.lastInteractionIn
                      ? schedule.lastInteractionIn
                      : '-'
                  }`}
                </div>
                <div className="flex mt3">
                  <div className="mr4">
                    {intl.formatMessage(messages.nextSchedule)}
                  </div>
                  {`${schedule ? schedule.nextExecution : '-'}`}
                </div>
              </div>
              <div className="flex items-center">
                <div className={'w4'}>
                  <Toggle
                    label={
                      schedule
                        ? intl.formatMessage(messages.active)
                        : intl.formatMessage(messages.inactive)
                    }
                    semantic
                    size="large"
                    checked={schedule?.nextExecution}
                    onChange={() => handleChange()}
                  />
                </div>
              </div>
            </div>
          </PageBlock>
          <Carriers />
        </Tab>
      </Tabs>
    </Layout>
  )
}

export default injectIntl(AdminExample)
