import { httpClient } from "@/src/lib/axious/httpClient"
import { IExpert } from "@/src/types/expert.types"





export const getExperts = async () => {
    const experts = await httpClient.get<IExpert[]>('/experts')
    return experts
}