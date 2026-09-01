import { Product } from "../../entities/Product";
import { ProductRepositoryImpl } from "../../../Data/repositories/ProductRepository";

const { getAll, getById, create, update, remove } = new ProductRepositoryImpl();

export const GetProductsUseCase = async () => {
    return await getAll();
}

export const GetProductByIdUseCase = async (id: number) => {
    return await getById(id);
}

export const CreateProductUseCase = async (product: Product) => {
    return await create(product);
}

export const UpdateProductUseCase = async (id: number, product: Product) => {
    return await update(id, product);
}

export const DeleteProductUseCase = async (id: number) => {
    return await remove(id);
}
