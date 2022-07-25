import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
const RECAPTCHA = process.env["recaptchaCode"]

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log("Body: ", req.body)

    let validation = await validateRECAP(req.body["g-recaptcha-response"]);
    context.log(validation);

    if (validation) {
        context.log("validation succeeded");
        context.res = {
            status: 200
        }
    } else {
        context.log("validation failed");
        context.res = {
            status: 500
        }
    }
};

export default httpTrigger;

async function validateRECAP(token: string) {
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
            console.log(error);
        });
}
