export interface QueryStatusWidgetRequest {
    MaxRows?: number
}

export interface StatusWidgetResponse {
    Statuses: StatusWidgetResponseLine[]
    TotalCount: number
}

export interface StatusWidgetResponseLine {
    Status: string
    Count: number
    StatusID: any
}

export interface FeedbackWidgetRequest {
    StartDate: string | null
}

export interface FeedbackWidgetResponse {
    Lines: FeedbackWidgetResponseLine[]
}

export interface FeedbackWidgetResponseLine {
    Rating: number
    Count: number
}