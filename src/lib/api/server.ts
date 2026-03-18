import { auth } from "@/lib/auth"
// import { headers } from "next/headers"

// await auth.api.getSession({
//     headers: await headers() // headers containing the user's session token
// })

const {headers, response} = await auth.api.signInEmail({
    returnHeaders: true,
    body: {
        email: "",
        password: ""
    },
    //headers: await headers() // optional but would be useful to get the user IP, user agent, etc.
})

await auth.api.verifyEmail({
    query: {
        token: "my_token"
    }
})