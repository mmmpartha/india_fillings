import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Cart = () => {
    const [cart, setCart] = useState([]);

    const loadCart = useCallback(async () => {
        try {
            const storedCart = await AsyncStorage.getItem('cart');
            console.log("stored Cart", storedCart);

            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [loadCart])
    );

    const removeFromCart = async (code) => {
        const updatedCart = cart.filter(item => item.code !== code);
        setCart(updatedCart);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cart</Text>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image
                            source={item.image ? { uri: item.image } : require('../assets/tab/books.png')}
                            style={styles.image}
                        />
                        <View style={styles.details}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => removeFromCart(item.code)}
                            >
                                <Text style={styles.buttonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    details: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 14,
        color: 'green',
        marginVertical: 5,
    },
    button: {
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Cart;
