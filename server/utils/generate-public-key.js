try {
    const Generate__Public__Key__From__Private__Key = (private__Key) => {
        var public__Key = "";
        var temp = "";

        for (let i = 0; i < private__Key.length; i++) {
            temp = "";
            let ascii = private__Key.charCodeAt(i);
            let d = ascii % 10;
            if (d < 5) {
                let x = ascii - d;
                temp = String.fromCharCode(x) + "o" + d.toString();
            }
            if (d >= 5) {
                let d2 = 10 - d;
                let x = ascii + d2;
                temp = String.fromCharCode(x) + "e" + d2.toString();
            }
            public__Key = public__Key + temp;
        }

        let arr = [];
        for (let i = 0; i < public__Key.length; i++) {
            arr[i] = public__Key.charCodeAt(i);
        }

        public__Key = "";

        for (let i = 0; i < arr.length; i++) {
            public__Key = public__Key + arr[i].toString(16) + "";
        }
        return public__Key;
    };

    module.exports = Generate__Public__Key__From__Private__Key;
} catch (error) {
    console.log(
        "Some error occured in the file named Generate__Public__Key.js " + error
    );
}
