import { ErgoAddress, SBool, SByte, SColl, SConstant, SSigmaProp, SGroupElement } from "@fleet-sdk/core";
import { stringToBytes } from "@scure/base";
import { connected } from "./store";
import { get } from "svelte/store";

export function serializedToRendered(serializedValue: string): string {
    // Assuming the serialized value always starts with a pattern to strip (e.g., '0e')
    const patternToStrip = '0e';
    if (serializedValue.startsWith(patternToStrip)) {
        // Remove the pattern and return the hex string
        return serializedValue.substring(patternToStrip.length).substring(2);
    } else {
        // If the pattern does not exist at the start, return the original string
        return serializedValue.substring(2);
    }
}

export function hexToUtf8(hexString: string): string | null {
    try {
        if (hexString.length % 2 !== 0) {
        console.log('The hexadecimal string has an odd length.');
        return null;
        }
    
        // Convierte la cadena hexadecimal a un array de bytes
        const byteArray = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
        // Crea un nuevo TextDecoder para convertir el array de bytes a una cadena UTF-8
        const decoder = new TextDecoder('utf-8');
        const utf8String = decoder.decode(byteArray);
    
        return utf8String;
    } catch {
        console.log("hex to utf-8 error with ", hexString, typeof(hexString))
        return null;
    }
  }

// ErgoValue(SigmaProp(ProveDlog(ECPoint(8696f0,515cda,...))), ErgoType(SigmaProp))

export function generate_pk_proposition(wallet_pk: string): string {
    // Decode the address and extract the public key
    const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    
    // Create a SGroupElement from the public key
    const groupElement = SGroupElement(pk);
    
    // Wrap the SGroupElement with SSigmaProp to create a Sigma proposition
    const sigmaProp = SSigmaProp(groupElement);
    
    // Return the hex representation of the Sigma proposition
    return sigmaProp.toHex();
}

export function stringToSerialized(value: string): string {
    return SConstant(SColl(SByte, stringToBytes('utf8', value)));
}

export function booleanToSerializer(value: boolean): string {
    return SConstant(SBool(value));
}

export function stringToRendered(value: string): string {
    return serializedToRendered(stringToSerialized(value));
}

function renderedToSerialized(renderedValue: string): string {
    const patternToStrip = '0e';
    const serializedValue = patternToStrip + 'xx' + renderedValue;
    return serializedValue;
  }
  
function serializedToString(serialized: string): string {
    try {
        const byteArray = Uint8Array.from(serialized.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const decoder = new TextDecoder('utf-8');
        const utf8String = decoder.decode(byteArray);
        return utf8String;
    } catch {
        console.log("Error al convertir el valor serializado a string con", serialized);
        return '';
    }
}

export function renderedToString(renderedValue: string): string {
    const serialized = renderedToSerialized(renderedValue);
    return serializedToString(serialized);
  }


export async function check_if_r7_is_local_addr(value: string): Promise<boolean> {
    if (!get(connected)) return false;
    return generate_pk_proposition((await ergo.get_change_address())).substring(4,) === value;
}
