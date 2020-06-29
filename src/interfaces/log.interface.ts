export default interface Log {
    sender: string
    receiver: string
    timestamp: number
    message: string
    initialMessage: boolean
    account: string
    graph: string
    isError: boolean
    elapsed: number
}