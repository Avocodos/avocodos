type AppProps = {
    uid: string,
    name: string,
    type: "chat" | "posts" | "files",
    userId: string | number
}

type UserProps = {
    id: string | number,
    name: string | null | undefined,
    email: string | null | undefined
}

type NotificationsProps = {
    userId: number
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const initApp = async ({ uid, name, type, userId }: AppProps) => {
    let response = await fetch(`${process.env.WEAVY_URL}/api/apps/init`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${process.env.WEAVY_API_KEY}`
        },
        body: JSON.stringify({ app: { uid: uid, name: name, type: type }, user: { uid: getUserName(userId) } })
    });

    return response
}

export const syncUser = async ({ id, name, email }: UserProps) => {
    let response = await fetch(`${process.env.WEAVY_URL}/api/users/${getUserName(id)}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${process.env.WEAVY_APIKEY}`
        },
        body: JSON.stringify({ name: name, email: email, directory: "AVOCODOS" })
    });
    return response
}

export const getUserName = (userId: string | number | undefined) => {
    return `avocodosuser-${userId}`;
}