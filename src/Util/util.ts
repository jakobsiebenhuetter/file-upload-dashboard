export function isImage(ext: string) : boolean {
    //  || ext === 'webp';
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp';
}