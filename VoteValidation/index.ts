import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, voteIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    context.log("Vote: ", voteIn)

    let successForward = "https://mitbestimmen.jublaost.ch/messages/success";
    let errorForward = "https://mitbestimmen.jublaost.ch/messages/error";

    if (req.query.code == voteIn.code) {
        voteIn.approved = true
        context.bindings.voteOut = voteIn

        context.res = { status: 302, headers: { "location": successForward }, body: null };
        return
    } else {
        context.res = { status: 302, headers: { "location": errorForward }, body: null };
        return
    }

};

export default httpTrigger;