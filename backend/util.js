function validateInput(input) {
    if(!input || input.trim() === '') {
        return false;
    }
    return true;
}


module.exports = {
    validateInput
};