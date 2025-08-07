const crypto = require("crypto");

try {
    const generate__url = (len) => {
        return crypto
            .randomBytes(Math.ceil(len / 2))
            .toString("hex")
            .slice(0, len);
    };

    module.exports = generate__url
} catch (error) {
    console.log(
        "Some error occured in Url_Generator.js" + error
    );
}
