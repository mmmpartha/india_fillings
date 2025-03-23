import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedData, setEditedData] = useState({ name: "", price: "", quantity: "" });

  useFocusEffect(
    useCallback(() => {
      const fetchProducts = async () => {
        try {
          const storedProducts = await AsyncStorage.getItem("products");
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };

      fetchProducts();
    }, [])
  );

  const deleteProduct = async (id) => {
    try {
      const updatedProducts = products.filter((product) => product.id !== id);
      await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      Alert.alert("Success", "Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product.id);
    setEditedData({ name: product.name, price: product.price.toString(), quantity: product.quantity.toString() });
  };

  const saveProduct = async (id) => {
    try {
      const updatedProducts = products.map((product) =>
        product.id === id ? { ...product, name: editedData.name, price: parseFloat(editedData.price), quantity: parseInt(editedData.quantity) } : product
      );

      await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setEditingProduct(null);
      Alert.alert("Success", "Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product List</Text>
      {products.length === 0 ? (
        <Text style={styles.noProducts}>No products available</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              {editingProduct === item.id ? (
                // Show input fields when editing
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={editedData.name}
                    onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                    placeholder="Product Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedData.price}
                    onChangeText={(text) => setEditedData({ ...editedData, price: text })}
                    placeholder="Price"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedData.quantity}
                    onChangeText={(text) => setEditedData({ ...editedData, quantity: text })}
                    placeholder="Quantity"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => saveProduct(item.id)} style={styles.saveButton}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Show product details when not editing
                <>
                  <Text style={styles.productText}>
                    {item.name} - ${item.price} - Qty: {item.quantity}
                  </Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => editProduct(item)} style={styles.editButton}>
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteProduct(item.id)} style={styles.deleteButton}>
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  noProducts: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  productText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
  editContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default ProductList;
