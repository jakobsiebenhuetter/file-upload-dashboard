export function validateInput(input: string): boolean {
    if(!input || input.trim() === '') {
        return false;
    }
    return true;
}