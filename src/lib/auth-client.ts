import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [
        adminClient(),
    ]
    
})

// const signIn = async () => {
//     const data = await authClient.signIn.social({
//         provider: "google",
//         idToken: {
//             token: "",
//             accessToken: ""
//         }
//     });
// }