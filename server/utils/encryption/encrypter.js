const sha__1 = require("crypto-js/sha1"); // Importing the crypto module for encrypting our user's passwords

const sha__224 = require("crypto-js/sha224"); // Importing the crypto module for encrypting our user's passwords

const sha__256 = require("crypto-js/sha256"); // Importing the crypto module for encrypting our user's passwords

const sha__384 = require("crypto-js/sha384"); // Importing the crypto module for encrypting our user's passwords

const sha__512 = require("crypto-js/sha512"); // Importing the crypto module for encrypting our user's passwords

const sha__3 = require("crypto-js/sha3"); // Importing the crypto module for encrypting our user's passwords

const md__5 = require("crypto-js/md5"); // Importing the crypto module for encrypting our user's passwords

const generate__hashing__key = require("../../src/generate-private-key");

const Generate__Public__Key__From__Private__Key = require("../../src/generate-public-key");

try {
    const Ignite__Encryption = async (data__To__Be__Encrypted) => {
        return await Encrypt__Data__With__Key(data__To__Be__Encrypted);
    };

    const Encrypt__Data__With__Key = async (data__To__Be__Encrypted) => {
        var flag = -1;

        let data__To__Be__Encrypted__Length = data__To__Be__Encrypted.length;


        var hashing__Key = "";

        let cipher__Text = [];

        let j = 0;

        let private__Hashing__Key = generate__hashing__key(
            data__To__Be__Encrypted__Length
        );


        var switch__Key = Math.round(Math.random() * 4);

        // Hashing the private key

        switch (switch__Key) {
            case 0:
                hashing__Key = sha__1(private__Hashing__Key);
                flag = 0;
                break;
            case 1:
                hashing__Key = sha__256(private__Hashing__Key);
                flag = 1;
                break;
            case 2:
                hashing__Key = sha__512(private__Hashing__Key);
                flag = 2;
                break;
            case 3:
                hashing__Key = sha__3(private__Hashing__Key);
                flag = 3;
                break;
            case 4:
                hashing__Key = md__5(private__Hashing__Key);
                flag = 4;
                break;
        }

        hashing__Key = hashing__Key.toString(); // Converting the private key to String


        // Main Encryption Starts

        if (data__To__Be__Encrypted__Length < hashing__Key.length) {
            for (let i = 0; i < hashing__Key.length; i++) {

                if (i < data__To__Be__Encrypted__Length) {
                    cipher__Text[j] = await
                        (data__To__Be__Encrypted.charCodeAt(j) + hashing__Key.charCodeAt(i));
                    j++;

                    if (j === data__To__Be__Encrypted__Length) {
                        j = 0;
                    }
                }

                if (i >= data__To__Be__Encrypted__Length) {
                    cipher__Text[j] = await (cipher__Text[j] + hashing__Key.charCodeAt(i));
                    j++;

                    if (j === data__To__Be__Encrypted__Length) {
                        j = 0;
                    }
                }

            }
        }

        // Encryption for strings smaller that hashing key lenght above

        if (hashing__Key.length === data__To__Be__Encrypted__Length) {

            for (let i = 0; i < hashing__Key.length; i++) {
                cipher__Text[i] = await
                    (data__To__Be__Encrypted.charCodeAt(i) + hashing__Key.charCodeAt(i));
            }

        }

        // Encryption for strings equal to hashing key lenght above

        if (hashing__Key.length < data__To__Be__Encrypted__Length) {
            j = 0;

            for (let i = 0; i < data__To__Be__Encrypted__Length; i++) {

                cipher__Text[i] = await (data__To__Be__Encrypted.charCodeAt(i)) + (hashing__Key.charCodeAt(j));
                j++;
                if (j == hashing__Key.length) {
                    j = 0;
                }

            }
        }

        // Encryption for strings longer that hashing key lenght above

        // Secondary Encryption starts

        var cipher__text = "";
        let l = 1;

        // First secodary encryption

        for (let i = 0; i < cipher__Text.length; i++) {
            cipher__Text[i] = await cipher__Text[i] * l;
            l += 5;
        }

        // Second Secondary encryption

        var c = 65;
        for (let i = 0; i < cipher__Text.length; i++) {
            cipher__Text[i] = await cipher__Text[i] + c;
            c++;
        }

        // Ternary secondary encryption

        for (let i = 0; i < cipher__Text.length; i++) {
            cipher__Text[i] = await cipher__Text[i] + private__Hashing__Key.charCodeAt(i);
        }

        // Quad secondary encryption

        for (let i = 0; i < cipher__Text.length; i++) {
            cipher__text = cipher__text + (cipher__Text[i].toString(16) + "x");
        }

        // Converting flag to binary

        flag = flag.toString(2);

        // Converting the private key to public key

        const public__Hashing__Key = Generate__Public__Key__From__Private__Key(
            private__Hashing__Key
        );

        var public__Key__Text = [];

        l = 1;
        for (let i = 0; i < public__Hashing__Key.length; i++) {
            public__Key__Text[i] = public__Hashing__Key.charCodeAt(i) * l;
            l++;
        }

        for (let i = 0; i < public__Key__Text.length; i++) {
            cipher__text = cipher__text + (public__Key__Text[i].toString(16) + "^");
        }

        return await Display__Encrypted__Word(cipher__text, flag);
    }

    const Display__Encrypted__Word = async (cipher__text, flag) => {
        const final__Cipher__Text = await (cipher__text + flag)

        return final__Cipher__Text;
    };

    module.exports = Ignite__Encryption;
} catch (error) {
    console.log('Some error occured in Basic Encryption Software ' + error)
}