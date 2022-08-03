import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, voteIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let successForward = "https://link.jublaost.ch/votingSuccess";
    let errorForward = "https://link.jublaost.ch/votingError";

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