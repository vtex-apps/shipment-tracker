export const schedule = {
  create: async (_: any, _args: any, ctx: Context): Promise<any> => {
    const {
      clients: { scheduler },
      // clients: { scheduler, apps },
      vtex: { workspace, account },
    } = ctx

    const schedulerData = {
      id: `vtex-shipping-tracker`,
      scheduler: {
        expression: '* * * * *',
        endDate: '2021-02-13T00:00:00',
      },
      request: {
        method: 'GET',
        uri: `https://${workspace}--${account}.myvtex.com/_v/api/tracking/update`,
      },
    }

    const response = await scheduler.createSchedule(schedulerData)

    console.log('create scheduler', response)

    return response
  },
}
