import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, votesIn): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    // let data: { category: string, options: { option: string, count?: number, totalCount?: number, votes: any[] }[] }[] = [];
    let data: { category: string, options: { option: string, count?: number, totalCount?: number }[] }[] = [];
    for (let vote of votesIn) {
        let categories = data.find(x => x.category == vote.category);
        if (categories) {
            let option = categories.options.find(x => x.option == vote.option);
            if (option) {
                option.totalCount++;
                if (vote.approved == true) option.count++;
            } else {
                // categories.options.push({ option: vote.option, votes: [vote] })
                categories.options.push({ option: vote.option, totalCount: 1, count: (vote.approved == true) ? 1 : 0 });
            }
        } else {
            data.push({
                category: vote.category, options: [{ option: vote.option, totalCount: 1, count: (vote.approved == true) ? 1 : 0 }]
            });
        }
    }
    /*for (let i of data) {
        for (let j of i.options) {
            j.count = j.votes.filter(x => x.approved == true).length;
            j.totalCount = j.votes.length;
        }
    }*/
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: data
    };

};

let bla = [
    {
        category: "",
        items: []
    }
]

export default httpTrigger;

