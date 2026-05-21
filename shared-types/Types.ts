export type TFile = {
    id: string;
    title: string;
    date: string;
    path: string;
    thumbnailPath: string;
}

export type TPageData = {
    currentPage: number;
    maxPages: number;
    files: TFile[];
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    filesPerPage?: TFile[]; // Muss noch vollständig implementiert werden
    message: string;
    type: 'success' | 'error' | 'info';
    state: 'filter' | 'no-filter';
    info: string;
}