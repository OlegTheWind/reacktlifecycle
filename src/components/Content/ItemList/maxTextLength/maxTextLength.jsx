import PropTypes from 'prop-types'

function maxTextLength(text, maxLength = 199) {
    if ( !text ) {
        return ''
    }
    if (text.length <= maxLength) {
        return text
    }
    const words = text.split(' ')
    let truncatedText = ''
    let currentLength = 0
    for (let i = 0; i < words.length; i += 1) {
        const word = words[i]
        if (currentLength + word.length + 1 <= maxLength) {
            truncatedText += (truncatedText ? ' ' : '') + word
            currentLength += word.length + 1
        } else {
            break
        }
    }
    return truncatedText
}

maxTextLength.prototype = {
    text: PropTypes.string.isRequired,
    maxLength: PropTypes.number.isRequired,
}
export default maxTextLength
