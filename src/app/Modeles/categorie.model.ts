import { Livre } from "./livre.model";

export interface Categorie{
    id: string;
    nomCat: string ; 
    livres : Livre[] ; 
}