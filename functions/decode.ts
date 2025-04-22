import {ethers} from "ethers";
import {getResponse} from "../src/networkUtils";

export const onRequest: PagesFunction<Env> = async (context) => {
    try {
        switch (context.request.method) {
            case "OPTIONS":
                return getResponse(JSON.stringify({msg: 'options throughput'}))
            case "POST":
                const payload = await context.request.json();
                const abi = payload.abi as any;
                const decodedInput = payload.decodedInput as string;

                const fnName = abi.name;

                //TODO: Make an object containing all output types
                const outputComponents = abi.outputs[0].components;

                const i = new ethers.Interface([abi]);
                const decoded = i.decodeFunctionResult(fnName, decodedInput);

                const result: Record<string, any> = {};
                for (let index = 0; index < outputComponents.length; index++) {
                    const { name, type } = outputComponents[index];
                    let value: any = decoded[0][index];

                    if (type.startsWith("uint") || type.startsWith("int")) {
                        try {
                            const asNumber = Number(value.toString());
                            value = Number.isSafeInteger(asNumber) ? asNumber : BigInt(value.toString());
                        } catch {
                            value = BigInt(value.toString());
                        }
                    } else if (type === "bytes32" || type.startsWith("bytes")) {
                        value = value.toString();
                    } else if (type === "address") {
                        value = value.toLowerCase();
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
