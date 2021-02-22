import { InstanceOptions, IOContext, JanusClient } from '@vtex/api'

const routes = {
  scheduler: (workspace: string, account: string) =>
    `/api/scheduler/${workspace}/${account}?version=4`,
  getSchedule: (workspace: string, account: string) =>
    `/api/scheduler/${workspace}/${account}/vtex-shipping-tracker?version=4`,
}

export default class SchedulerClient extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: ctx.authToken,
      },
    })
  }

  public createSchedule = (
    schedulerData: CreateSchedulerArgs
  ): Promise<CreateSchedulerResponse> => {
    return this.http.post(
      routes.scheduler(this.context.workspace, this.context.account),
      schedulerData,
      { metric: 'scheduler-create-schedule' }
    )
  }

  public viewSchedule = async (): Promise<ViewSchedulerResponse> => {
    return this.http.get(
      routes.getSchedule(this.context.workspace, this.context.account),
      { metric: 'scheduler-view-schedule' }
    )
  }

  public deleteSchedule = async () => {
    return this.http.delete(
      routes.getSchedule(this.context.workspace, this.context.account),
      { metric: 'scheduler-delete-schedule' }
    )
  }
}
