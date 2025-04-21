import {ethers} from "ethers";
import {getResponse} from "../src/networkUtils";

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        switch (context.request.method) {
            case "OPTIONS":
                return getResponse(JSON.stringify({msg: 'options throughput'}))
            case "POST":
                const payload = await context.request.json();
                const functionName = payload.functionName as string;
                const functionAbi = payload.abi as string;
                const decodedInput = payload.decodedInput as string;

                const i = new ethers.Interface([
                    functionAbi
                ]);

                const decoded = i.decodeFunctionResult(functionName, decodedInput);

                return getResponse(JSON.stringify(decoded));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
