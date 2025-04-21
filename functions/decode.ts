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
                const decodedInput = payload.decodedInput as string;

                const i = new ethers.Interface(functionAbi);

                const decoded = i.decodeFunctionResult(functionName, decodedInput);

                const functionAbiEntry = functionAbi.find((f) => f.name === functionName);
                const outputComponents = functionAbiEntry.outputs[0].components;

                const result: Record<string, string> = {};
                for (let index = 0; index < outputComponents.length; index++) {
                    const name = outputComponents[index].name;
                    const value = decoded[0][index];
                    result[name] = value.toString();
                }

                return getResponse(JSON.stringify(result));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
