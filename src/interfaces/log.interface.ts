export default interface Log {
    sender: string
    receiver: string
    timestamp: number
    log: string
    initialMessage: boolean
    account: string
    graph: string
    error: boolean
    elapsed: number
}