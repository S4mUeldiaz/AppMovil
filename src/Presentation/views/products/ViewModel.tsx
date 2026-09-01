import React, { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import { Product } from '../../../Domain/entities/Product';
import {
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
} from '../../../Domain/UseCases/product/ProductUseCases';

export const ProductsViewModel = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [searchId, setSearchId] = useState('');
    const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const response = await GetProductsUseCase();
        if (response.success) {
            setProducts(response.data);
        } else {
            ToastAndroid.show(response.message, ToastAndroid.LONG);
        }
    };

    const handleAddProduct = async () => {
        if (name.trim() === '' || price.trim() === '') {
            ToastAndroid.show('Nombre y precio son obligatorios', ToastAndroid.LONG);
            return;
        }
        const response = await CreateProductUseCase({ name, price: parseFloat(price) });
        if (response.success) {
            setProducts([...products, response.data]);
            setName('');
            setPrice('');
        } else {
            ToastAndroid.show(response.message, ToastAndroid.LONG);
        }
    };

    const handleUpdateProduct = async () => {
        if (selectedProductId === null) return;
        const response = await UpdateProductUseCase(selectedProductId, { name, price: parseFloat(price) });
        if (response.success) {
            setProducts(products.map(p => p.id === selectedProductId ? response.data : p));
            setSelectedProductId(null);
            setName('');
            setPrice('');
        } else {
            ToastAndroid.show(response.message, ToastAndroid.LONG);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setName(product.name);
        setPrice(product.price.toString());
        setSelectedProductId(product.id ?? null);
    };

    const handleDeleteProduct = async (id: number) => {
        const response = await DeleteProductUseCase(id);
        if (response.success) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            ToastAndroid.show(response.message, ToastAndroid.LONG);
        }
    };

    const handleSearchProduct = async () => {
        if (searchId.trim() === '') return;
        const response = await GetProductByIdUseCase(parseInt(searchId));
        if (response.success) {
            setSearchedProduct(response.data);
        } else {
            setSearchedProduct(null);
            ToastAndroid.show(response.message, ToastAndroid.LONG);
        }
    };

    const toggleModal = () => setModalVisible(!isModalVisible);

    return {
        products,
        name,
        price,
        selectedProductId,
        searchId,
        searchedProduct,
        isModalVisible,
        setName,
        setPrice,
        setSearchId,
        handleAddProduct,
        handleUpdateProduct,
        handleSelectProduct,
        handleDeleteProduct,
        handleSearchProduct,
        toggleModal,
    };
};

export default ProductsViewModel;
