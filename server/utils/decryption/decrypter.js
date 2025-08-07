const sha__1 = require("crypto-js/sha1"); // Importing the crypto module for encrypting our user's passwords

const sha__224 = require("crypto-js/sha224"); // Importing the crypto module for encrypting our user's passwords

const sha__256 = require("crypto-js/sha256"); // Importing the crypto module for encrypting our user's passwords

const sha__384 = require("crypto-js/sha384"); // Importing the crypto module for encrypting our user's passwords

const sha__512 = require("crypto-js/sha512"); // Importing the crypto module for encrypting our user's passwords

const sha__3 = require("crypto-js/sha3"); // Importing the crypto module for encrypting our user's passwords

const md__5 = require("crypto-js/md5"); // Importing the crypto module for encrypting our user's passwords

try {

    const Ignite__Decryption = (cipher__Text) => {
        let last__Index__Of__X = cipher__Text.lastIndexOf("x");

        var data__To__Be__Decrypted = cipher__Text.substring(
            0,
            last__Index__Of__X + 1
        );

        var public__Key = cipher__Text.substring(
            last__Index__Of__X + 1,
            cipher__Text.lastIndexOf("^") + 1
        );

        var flag = parseInt(
            cipher__Text.substring(
                cipher__Text.lastIndexOf("^") + 1,
                cipher__Text.length
            ),
            2
        );

        const private__Key = Decrypt__Public__Key(
            Decrypt__Public__Key__Main(public__Key)
        );

        const hashing__Key = Get__Hashing__Key(flag, private__Key);

        const plain__Text = Decrypt__Main__Data(
            data__To__Be__Decrypted,
            hashing__Key,
            private__Key
        );

        return plain__Text;
    }


    const Get__Hashing__Key = (flag, private__Hashing__Key) => {
        var switch__Key = flag;
        var hashing__Key;

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

        return hashing__Key.toString();
    };


    const Decrypt__Public__Key = (public__main__Key) => {
        var public__key = "";
        var arr = [];
        var j = 0;
        var y = 2;

        for (let i = 0; i < public__main__Key.length / 2; i++) {
            arr[i] = parseInt(public__main__Key.substring(j, y), 16);
            j = y;
            y += 2;
        }

        for (let i = 0; i < arr.length; i++) {
            public__key = public__key + String.fromCharCode(arr[i]);
        }

        j = 0;
        y = 3;
        let ascii = 0;
        let private__Key = "";
        let len = public__main__Key.length / 6;

        for (let i = 0; i < len; i++) {
            let temp = public__key.substring(j, y);
            j = y;
            y += 3;
            if (temp.charAt(1) == "e") {
                ascii = temp.charCodeAt(0) - parseInt(temp.substring(2));
            }
            if (temp.charAt(1) == "o") {
                ascii = temp.charCodeAt(0) + parseInt(temp.substring(2));
            }
            private__Key = private__Key + String.fromCharCode(ascii);
        }

        return private__Key;
    };

    const Decrypt__Public__Key__Main = (public__Key) => {
        let actLenght2 = 0;
        for (let i = 0; i < public__Key.length; i++) {
            if (public__Key.charAt(i) == "^") {
                actLenght2++;
            }
        }
        let fromIndex2 = 0;
        let publicText = [];
        let h2 = public__Key.indexOf("^", fromIndex2);

        for (let i = 0; i < actLenght2; i++) {
            publicText[i] = parseInt(public__Key.substring(fromIndex2, h2), 16);
            fromIndex2 = h2 + 1;
            h2 = public__Key.indexOf("^", fromIndex2);
        }

        let o2 = 1;
        var publicKey2 = "";
        for (let i = 0; i < publicText.length; i++) {
            publicText[i] = publicText[i] / o2;
            o2++;
            publicKey2 = publicKey2 + String.fromCharCode(publicText[i]);
        }

        return publicKey2;
    };

    const Decrypt__Main__Data = (
        data__To__Be__Decrypted,
        hashing__Key,
        private__Key
    ) => {
        let index = data__To__Be__Decrypted.indexOf("x");

        let l = 0;
        for (let i = 0; i < data__To__Be__Decrypted.length; i++) {
            let c = data__To__Be__Decrypted.charAt(i);
            if (c === "x") {
                l++;
            }
        }

        let len = hashing__Key.length;
        let j = 0;
        let cipherText = [];
        for (let i = 0; i < l; i++) {
            cipherText[i] = parseInt(data__To__Be__Decrypted.substring(j, index), 16);
            j = index + 1;
            index = data__To__Be__Decrypted.indexOf("x", j);
        }


        for (let i = 0; i < cipherText.length; i++) {
            cipherText[i] = cipherText[i] - private__Key.charCodeAt(i);
        }

        let c = 65;
        for (let i = 0; i < cipherText.length; i++) {
            cipherText[i] = cipherText[i] - c;
            c++;
        }

        let l23 = 1;
        for (let i = 0; i < cipherText.length; i++) {
            cipherText[i] = cipherText[i] / l23;
            l23 += 5;
        }
        if (l < len) {
            let x = hashing__Key.length % l;
            if (x > 0) {
                let index2 = hashing__Key.length - x;
                let d = hashing__Key.substring(index2, hashing__Key.length);
                let l2 = d.length;
                for (let i = 0; i < l2; i++) {
                    cipherText[i] = cipherText[i] - d.charCodeAt(i);
                }
                let j2 = cipherText.length - 1;
                for (let i = index2 - 1; i >= 0; i--) {
                    cipherText[j2] = cipherText[j2] - hashing__Key.charCodeAt(i);
                    j2--;
                    if (j2 < 0) {
                        j2 = cipherText.length - 1;
                    }
                }
            }
            if (x == 0) {
                let index2 = hashing__Key.length - x;
                let j2 = cipherText.length - 1;
                for (let i = index2 - 1; i >= 0; i--) {
                    cipherText[j2] = cipherText[j2] - hashing__Key.charCodeAt(i);
                    j2--;
                    if (j2 < 0) {
                        j2 = cipherText.length - 1;
                    }
                }
            }
        }

        if (l == len) {
            for (let i = 0; i < cipherText.length; i++) {
                cipherText[i] = cipherText[i] - hashing__Key.charCodeAt(i);
            }
        }

        if (len < l) {
            j = 0;
            for (let i = 0; i < cipherText.length; i++) {
                cipherText[i] = cipherText[i] - hashing__Key.charCodeAt(j);
                j++;
                if (j == hashing__Key.length) {
                    j = 0;
                }
            }
        }

        var plainText = "";
        for (let i = 0; i < cipherText.length; i++) {
            plainText = plainText + String.fromCharCode(cipherText[i]);
        }

        return plainText;
    };

    module.exports = Ignite__Decryption;
} catch (error) {
    console.log('Some error occured in the Test Decrypting Software JS ' + error)
}