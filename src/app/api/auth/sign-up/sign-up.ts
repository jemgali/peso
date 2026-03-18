import { authClient } from "@/lib/auth-client";

const email = ""
const password = ""
const name = ""

const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard"
    }, {
        onRequest: (ctx: any) => {
            //show loading
        },
        onSuccess: (ctx: any) => {
            //redirect to the dashboard or sign in page
        },
        onError: (ctx: { error: { message: string } }) => {
            // display the error message
            alert(ctx.error.message);
        },
});