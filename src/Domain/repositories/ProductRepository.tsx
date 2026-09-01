import { ResponseApiDelivery } from "../../Data/sources/remote/models/ResponseApiDelivery";
import { Product } from "../entities/Product";

export interface ProductRepository {
    getAll(): Promise<ResponseApiDelivery>;
    getById(id: number): Promise<ResponseApiDelivery>;
    create(product: Product): Promise<ResponseApiDelivery>;
    update(id: number, product: Product): Promise<ResponseApiDelivery>;
    remove(id: number): Promise<ResponseApiDelivery>;
}
