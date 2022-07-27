import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import { isContext } from "vm";
const RECAPTCHA = process.env["recaptchaCode"]

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log("Body: ", req.body)
    context.log("Verification Code: ", RECAPTCHA)

    let validation = await validateRECAP(context, req.body["g-recaptcha-response"]);

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

async function validateRECAP(context: Context, token: string) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: "https://www.google.com/recaptcha/api/siteverify",
        params: {
            secret: RECAPTCHA,
            response: token
        }
    }

    context.log("Config: ", config)

    return await axios(config)
        .then(response => {
            context.log("Response: ", response)
            context.log("ResponseData: ", response.data)
            return response.data.success;
        })
        .catch(error => {
            context.log(error);
        });
}
