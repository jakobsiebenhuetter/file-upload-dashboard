const { Entity, PrimaryGeneratedColumn, Column, Collection } = require("typeorm");

export class Folder {
    @PrimaryGeneratedColumn()
    id;

    @Column()
    folderId;

    @Column()
    folderName;

    @Column()
    path;
}