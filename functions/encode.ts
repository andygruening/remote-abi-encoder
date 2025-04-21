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
                const functionAbi = payload.abi as any[];
                const data = payload.data as Record<string, any>;

                const func = functionAbi.find((f) => f.name === functionName);
                if (!func) {
                    throw new Error(`Function "${functionName}" not found in ABI`);
                }

                const arrayOfValues = func.inputs.map((param: any) => {
                    const value = data[param.name];
                    if (typeof value === 'undefined') {
                        throw new Error(`Missing value for parameter "${param.name}"`);
                    }
                    return value;
                });

                const i = new ethers.Interface(functionAbi);
                const encoded = i.encodeFunctionData(functionName, arrayOfValues);

                return getResponse(JSON.stringify({encoded: encoded}));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
