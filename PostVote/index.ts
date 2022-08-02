import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
const RECAPTCHA = process.env["recaptchaCode"]

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, voteIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log("Body: ", req.body)
    context.log("VoteIn: ", voteIn)

    let validation = await validateRECAP(context, req.body["g-recaptcha-response"]);

    if (!validation) {
        context.log("validation failed");
        context.res = {
            status: 500
        }
        return
    }

    if (voteIn) {
        context.log("already voted");
        context.res = {
            status: 400,
            body: "already voted"
        }
        return
    }

    let vote = req.body;
    context.log("Vote: ", vote)

    try {
        context.bindings.voteOut = vote;
        context.res = {
            status: 200,
            body: "successful"
        }
        return
    } catch (e) {
        context.res = {
            status: 500,
            body: "server error"
        }
        return
    }

};

export default httpTrigger;

async function validateRECAP(context: Context, token: string) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: "https://www.google.com/recaptcha/api/siteverify",
        params: {
            secret: RECAPTCHA,
            response: token
        }
    }
    return await axios(config)
        .then(response => {
            return response.data.success;
        })
        .catch(error => {
            context.log(error);
        });
}
