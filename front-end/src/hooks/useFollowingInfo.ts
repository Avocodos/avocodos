import { FollowingInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const getFollowingInfo = async (userId: string): Promise<FollowingInfo> => {
    const response = await fetch(`/api/following/${userId}`);
    return response.json() as Promise<FollowingInfo>;
}

export default function useFollowingInfo(userId: string, initialState: FollowingInfo) {
    const { data } = useQuery({
        queryKey: ["followingInfo", userId],
        queryFn: () => getFollowingInfo(userId),
        initialData: initialState
    });

    return data;
}