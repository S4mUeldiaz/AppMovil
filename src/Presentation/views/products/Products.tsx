import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from '../../../../App';
import useViewModel from './ViewModel';
import styles from './Styles';

interface Props extends StackScreenProps<RootStackParamList, 'ProductsScreen'> {};

export const ProductsScreen = ({ navigation, route }: Props) => {

    const {
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
    } = useViewModel();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileInfoScreen')}>
                <Text style={styles.profileLink}>Perfil / Cerrar sesión</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Productos</Text>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id!.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productContainer}>
                        <Text style={styles.productText}>{item.name} - ${item.price}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => handleSelectProduct(item)}>
                                <Text style={styles.buttonText}>Modificar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handleDeleteProduct(item.id!)}>
                                <Text style={styles.buttonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Precio"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addButton} onPress={selectedProductId ? handleUpdateProduct : handleAddProduct}>
                <Text style={styles.addButtonText}>{selectedProductId ? 'Modificar Producto' : 'Crear Producto'}</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Numero de ID"
                value={searchId}
                onChangeText={setSearchId}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchProduct}>
                <Text style={styles.searchButtonText}>Buscar Producto</Text>
            </TouchableOpacity>

            {searchedProduct && (
                <View style={styles.productContainer}>
                    <Text style={styles.productText}>Producto Buscado: {searchedProduct.name} - ${searchedProduct.price}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.reportButton} onPress={toggleModal}>
                <Text style={styles.reportButtonText}>Generar Reporte</Text>
            </TouchableOpacity>

            {isModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reporte de Productos</Text>
                        <ScrollView>
                            {products.map(product => (
                                <Text key={product.id} style={styles.modalText}>{product.name} - ${product.price}</Text>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

export default ProductsScreen;
