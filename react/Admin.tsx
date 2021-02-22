import React, { FC, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
// import { FormattedMessage } from 'react-intl'
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
import CarrierTable from './components/CarrierTable'

import './styles.global.css'
import TrackingTable from './components/TrackingTable'

const AdminExample: FC = () => {
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
      pageHeader={
        <PageHeader
          title="Shipping Tracker"
          // title={<FormattedMessage id="admin-example.hello-world" />}
        />
      }
    >
      <Tabs fullWidth>
        <Tab
          label="Settings"
          active={activeTab === 1}
          onClick={() => setActiveTab(1)}
        >
          <div className="mt5" />
          <PageBlock title="Update Schedule" variation="full">
            <div className="flex justify-between">
              <div>
                <div className="flex">
                  <div className="mr4">Last Schedule Run:</div>
                  {`${
                    schedule?.lastInteractionIn
                      ? schedule.lastInteractionIn
                      : '-'
                  }`}
                </div>
                <div className="flex mt3">
                  <div className="mr4">Next Schedule Run:</div>
                  {`${schedule ? schedule.nextExecution : '-'}`}
                </div>
              </div>
              <div className="flex items-center">
                <div className={'w4'}>
                  <Toggle
                    label={schedule ? 'Active' : 'Inactive'}
                    semantic
                    size="large"
                    checked={schedule?.nextExecution}
                    onChange={() => handleChange()}
                  />
                </div>
              </div>
            </div>
          </PageBlock>
          <CarrierTable />
        </Tab>
        <Tab
          label="Tracking"
          active={activeTab === 2}
          onClick={() => setActiveTab(2)}
        >
          <div className="mt5" />
          <PageBlock variation="full">
            <TrackingTable />
          </PageBlock>
        </Tab>
      </Tabs>
    </Layout>
  )
}

export default AdminExample
