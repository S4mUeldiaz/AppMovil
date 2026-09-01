import { AxiosError } from "axios";
import { Product } from "../../Domain/entities/Product";
import { ProductRepository } from "../../Domain/repositories/ProductRepository";
import { ApiDelivery } from "../sources/remote/api/ApiDelivery";
import { ResponseApiDelivery } from "../sources/remote/models/ResponseApiDelivery";

const handleError = (error: unknown): ResponseApiDelivery => {
    const e = error as AxiosError<ResponseApiDelivery>;
    const apiError = e.response?.data;
    console.log('error ' + JSON.stringify(apiError ?? e.message));
    return apiError ?? {
        success: false,
        message: 'No se pudo conectar con el servidor',
        data: null,
        error: e.message,
    };
}

export class ProductRepositoryImpl implements ProductRepository {

    async getAll(): Promise<ResponseApiDelivery> {
        try {
            const response = await ApiDelivery.get<ResponseApiDelivery>('/products');
            return Promise.resolve(response.data);
        } catch (error) {
            return handleError(error);
        }
    }

    async getById(id: number): Promise<ResponseApiDelivery> {
        try {
            const response = await ApiDelivery.get<ResponseApiDelivery>(`/products/${id}`);
            return Promise.resolve(response.data);
        } catch (error) {
            return handleError(error);
        }
    }

    async create(product: Product): Promise<ResponseApiDelivery> {
        try {
            const response = await ApiDelivery.post<ResponseApiDelivery>('/products', product);
            return Promise.resolve(response.data);
        } catch (error) {
            return handleError(error);
        }
    }

    async update(id: number, product: Product): Promise<ResponseApiDelivery> {
        try {
            const response = await ApiDelivery.put<ResponseApiDelivery>(`/products/${id}`, product);
            return Promise.resolve(response.data);
        } catch (error) {
            return handleError(error);
        }
    }

    async remove(id: number): Promise<ResponseApiDelivery> {
        try {
            const response = await ApiDelivery.delete<ResponseApiDelivery>(`/products/${id}`);
            return Promise.resolve(response.data);
        } catch (error) {
            return handleError(error);
        }
    }
}
