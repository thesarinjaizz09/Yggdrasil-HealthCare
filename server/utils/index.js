import generate__url from "./connection-url-generator";
import Ignite__Decryption from "./decryption/decrypter";
import Ignite__Encryption from "./encryption/encrypter";

const isJsonString = (str) => {
    try {
        const token = JSON.parse(str);
        return token;
    } catch (e) {
        return str;
    }
}

module.exports = {
    isJsonString,
    generate__url,
    Ignite__Decryption,
    Ignite__Encryption
};
