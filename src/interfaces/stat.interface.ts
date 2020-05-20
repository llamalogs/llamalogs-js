export default interface Stat {
    component: string
    name: string
    value: number
    type: string
    timestamp: number
    account: string
    graph: string
    count?: number
}