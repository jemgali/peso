// import { authClient } from "@/lib/auth-client";

// const email = ""
// const password = ""
// const name = ""

// const { data, error } = await authClient.signUp.email({
//         email,
//         password,
//         name,
//         callbackURL: "/dashboard"
//     }, {
//         onRequest: (ctx: any) => {
//             //show loading
//         },
//         onSuccess: (ctx: any) => {
//             //redirect to the dashboard or sign in page
//         },
//         onError: (ctx: { error: { message: string } }) => {
//             // display the error message
//             alert(ctx.error.message);
//         },
// });

// await authClient.signIn.email(
//     {
//         email: "",
//         password: ""
//     },
//     {
//         onError: (ctx: { error: { message: string; status?: number} }) => {
//             if (ctx.error.status === 403) {
//                 alert("Please verify your email address")
//             }
//             alert(ctx.error.message)
//         }
//     }
// )

// export { }