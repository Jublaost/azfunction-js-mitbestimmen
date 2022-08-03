import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from 'axios';
import qs = require('qs');

const { v4: uuidv4 } = require('uuid')

const RECAPTCHA = process.env["recaptchaCode"]
const APP_ID = process.env["appId"];
const APP_SECRET = process.env["appSecret"];
const TENANT_ID = process.env["tenantId"];

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token';
const MS_GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const MS_GRAPH_ENDPOINT_SENDMAIL = 'https://graph.microsoft.com/v1.0/users/mitbestimmen@jublaost.ch/sendMail';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, voteIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.log("Body: ", req.body)
    context.log("VoteIn: ", voteIn)

    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

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

    let uuid = uuidv4();
    let vote = req.body;
    vote.code = uuid;
    vote.approved = false;

    context.log("Vote: ", vote)

    try {
        context.bindings.voteOut = vote;
        let token = await getToken();
        let mail = await sendMail(token, vote);
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


/**
 * Get Token for MS Graph
 */
async function getToken(): Promise<string> {
    const postData = {
        client_id: APP_ID,
        scope: MS_GRAPH_SCOPE,
        client_secret: APP_SECRET,
        grant_type: 'client_credentials'
    };

    return await axios
        .post(TOKEN_ENDPOINT, qs.stringify(postData))
        .then(response => {
            // console.log(response.data);
            return response.data.access_token;
        })
        .catch(error => {
            console.log(error);
        });
}


async function sendMail(token: string, vote: any) {
    let config: AxiosRequestConfig = {
        method: 'post',
        url: MS_GRAPH_ENDPOINT_SENDMAIL,
        headers: {
            'Authorization': 'Bearer ' + token //the token is a variable which holds the token
        },
        data: {
            "message": {
                "subject": "Verifizierung und Abschluss des Votings!",
                "body": {
                    "contentType": "html",
                    "content": "Vielen Dank füre deine Stimme!<br />'" + vote.category + "' mit der Option '" + vote.option + "'<br />Bitte bestätige nur noch deine Stimme mit folgendem Link: <a href='https://web-mitbestimmen.azurewebsites.net/api/VoteValidation?email=" + vote.email + "&code=" + vote.code + "'>Bestätigen</a><br /><br />Jublastische Grüsse<br />"
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": vote.email
                        }
                    }
                ]
            },
            "saveToSentItems": "true"
        }
    }

    return await axios(config)
        .then(response => {
            console.log(response.data);
            return response.data.value;
        })
        .catch(error => {
            console.log(error);
        });
}
