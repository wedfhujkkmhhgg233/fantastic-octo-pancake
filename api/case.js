import express from 'express';

const router = express.Router();

// Upside down character mapping
const upsideDownMap = {
    "a": "ɐ", "b": "q", "c": "ɔ", "d": "p", "e": "ǝ", "f": "ɟ", "g": "ƃ", "h": "ɥ", "i": "ᴉ",
    "j": "ɾ", "k": "ʞ", "l": "l", "m": "ɯ", "n": "u", "o": "o", "p": "d", "q": "b", "r": "ɹ",
    "s": "s", "t": "ʇ", "u": "n", "v": "ʌ", "w": "ʍ", "x": "x", "y": "ʎ", "z": "z",
    "A": "∀", "B": "ᗺ", "C": "Ɔ", "D": "ᗡ", "E": "Ǝ", "F": "Ⅎ", "G": "⅁", "H": "H", "I": "I",
    "J": "ſ", "K": "ʞ", "L": "⅃", "M": "W", "N": "N", "O": "O", "P": "Ԁ", "Q": "Ό", "R": "ᴚ",
    "S": "S", "T": "⊥", "U": "∩", "V": "Λ", "W": "M", "X": "X", "Y": "⅄", "Z": "Z",
    "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6",
    "0": "0", ".": "˙", ",": "'", "?": "¿", "!": "¡", "\"": ",", "'": ",", "(": ")", ")": "(",
    "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "&": "⅋", "_": "‾", " ": " "
};

// Case conversion function
function convertCase(text, type) {
    switch (type) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'upsidedown':
            return text.split('').map(char => upsideDownMap[char] || char).reverse().join('');
        case 'reverse':
            return text.split('').reverse().join('');
        case 'random':
            return text.split('').map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join('');
        case 'proper':
            return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        case 'toggle':
            return text.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('');
        default:
            return "Invalid converter type";
    }
}

// Route to convert case
router.get('/case', (req, res) => {
    const { convert, type } = req.query;

    // Validate input
    if (!convert || !type) {
        return res.status(400).json({
            error: "Please provide both 'convert' and 'type' query parameters."
        });
    }

    // Perform the case conversion
    const convertedText = convertCase(convert, type);

    // Respond with the converted text in the specified format
    res.json({
        api_info: {
            api_name: "Case Converter",
            description: "Easily convert text between different letter cases: Lower Case, Upper Case, Upsidedown, Reverse, Random, Proper, and Toggle. This API is ideal for developers who need to manipulate text formats for different use cases, such as user input normalization, text processing, or data presentation.",
            author: "Jerome"
        },
        original: convert,
        converted: convertedText,
        type: type
    });
});

// Metadata for the Case Converter service
const serviceMetadata = {
    name: "Case Converter",
    author: "Jerome",
    description: "Converts text into various cases based on the specified type.",
    category: "text-manipulation",
    link: ["/api/case?convert=hello%20world&type=uppercase"]
};

export { router, serviceMetadata };
