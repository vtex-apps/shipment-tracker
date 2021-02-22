interface CreateSchedulerArgs {
  id: string
  scheduler: { expression: string; endDate: string }
  request: {
    uri: string
    method: string
  }
}

interface ViewSchedulerResponse {
  id: string
  expression: string
  NextExecution: string
  endDate: string
  lastInteractionIn: string
  request: {
    uri: string
    method: string
  }
}

interface ViewSchedulerGraphQL {
  nextExecution: string
  lastInteractionIn: string
}

interface ViewSchedule {
  id: string
  expression: string
  NextExecution: string
  endDate: string
  lastInteractionIn: string
}

interface CreateSchedulerResponse {
  endpoint: string
  nextExecution: string
}
