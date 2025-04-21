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

                const result: Record<string, any> = {};
                for (let index = 0; index < outputComponents.length; index++) {
                    const { name, type } = outputComponents[index];
                    let value: any = decoded[0][index];

                    if (type.startsWith("uint") || type.startsWith("int")) {
                        try {
                            // Try number first, fallback to BigInt for large values
                            const asNumber = Number(value.toString());
                            value = Number.isSafeInteger(asNumber) ? asNumber : BigInt(value.toString());
                        } catch {
                            value = BigInt(value.toString());
                        }
                    } else if (type === "bytes32" || type.startsWith("bytes")) {
                        value = value.toString(); // keep hex string
                    } else if (type === "address") {
                        value = value.toLowerCase(); // normalize
                    }

                    result[name] = value;
                }

                return getResponse(JSON.stringify(result));
            default:
                throw new Error("Unsupported request method.");
        }
    } catch (e: Error) {
        return getResponse(`${e.message} (${e.stack})`, 500);
    }
};
