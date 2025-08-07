const crypto = require("crypto");

try {
    const generate__hashing__key = (len) => {
        return crypto
            .randomBytes(Math.ceil(len / 2))
            .toString("hex")
            .slice(0, len);
    };

    module.exports = generate__hashing__key;
} catch (error) {
    console.log(
        "Some error occured in Unique__Random__Key__Generator.js " + error
    );
}
