import {ethers} from "ethers";
import {getResponse} from "../src/networkUtils";

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        switch (context.request.method) {
            case "OPTIONS":
                return getResponse(JSON.stringify({msg: 'options throughput'}))
            case "POST":
                const payload = await context.request.json();
                const signature = payload.signature as string;
                const values = payload.values as any[];

                const fnName = signature.split('(')[0].split(' ')[1];
                const i = new ethers.Interface([signature]);
                const encoded = i.encodeFunctionData(fnName, values);

                return getResponse(JSON.stringify({encoded: encoded}));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
